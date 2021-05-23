/*
 * Module to help get data from cowin site, using the exposed pulbic api
 * HanishKVC, 2021
 * GPL
 */


/*
 * The db schema
 * 	states (bunch of state objects)
 * 		state_id
 * 		name
 * 		districts (bunch of district objects)
 * 			district_id
 * 			name
 * 			vaccenters (bunch of vaccine center objects)
 * 				vaccenterInstances (kind of array of same vaccine center instances)
 * 					center_id
 * 					name
 * 					available_capacity
 * 					...
 * 					NOTE: As each vaccine center could provide different vaccines
 * 					to different age group people, so each such unique combination
 * 					will be treated as a vcInstance.
 * 						Ex: VC1_45+_Covishield, VC1_18+_Covishield, VC1_45+_Covaxin, ...
 *
 */


const srvr = "https://cdn-api.co-vin.in/api";
var fetchOptions = {
	headers: {
		"User-Agent": "india-hkvc/20210524.01 node-fetch/202105"
		}
	}


/*
 * Convert the given vaccine center instance into a string
 * containing useful info about the same, along with the state-dist
 */
function vaccenter_string(vc, stateName, districtName) {
	let sLocation = `${stateName} ${districtName}`;
	let sVC = `${vc.vaccine} ${vc.available_capacity} -- ${vc.name} ${vc.pincode} -- ${vc.min_age_limit}+`;
	return `${sLocation} -- ${sVC}`;
}


function vaccenter_string_ex(db, stateId, districtId, vcenterId, vcInstanceId) {
	//console.log("INFO:VacCenterString:", stateId, districtId, vcenterId, vcInstanceId);
	let stateN = db.states[stateId].name;
	let distN = db.states[stateId].districts[districtId].name;
	let vc = db.states[stateId].districts[districtId].vaccenters[vcenterId];
	vcInst = vc[vcInstanceId];
	return vaccenter_string(vcInst, stateN, distN);
}


/*
 * Look at vaccine centers with vaccine availability in the given db.
 * db.vaccine
 * 	if defined, then return vaccenter's which have that vaccine.
 * 	if ANY/null/undefined all vaccine types will be selected.
 * The callback will be called for any valid vaccenters'.
 *	passAlong will be passed to the callback.
 *	Args: db, stateId, districtId, vaccenterInstance, passAlong
 */
function dblookup_vaccenters(db, callback, passAlong=null) {
	let vacType = db.vaccine;
	if (vacType === undefined) {
		vacType = null;
	} else if (vacType !== null) {
		vacType = vacType.toUpperCase();
		if (vacType === 'ANY') vacType = null;
	}
	for(sk in db.states) {
		let state = db.states[sk];
		for(dk in state.districts) {
			let dist = state.districts[dk];
			for(vk in dist.vaccenters) {
				let vc = dist.vaccenters[vk];
				//console.log(vc);
				for(ik in vc) {
					vcInst = vc[ik];
					if ((vacType !== null) && (vacType !== vcInst.vaccine.toUpperCase())) continue;
					if (vcInst.available_capacity === 0) continue;
					callback(db, sk, dk, vcInst, passAlong);
				}
			}
		}
	}
}


function _add2vaccenter(oVCs, vcInst) {
	var vc = oVCs[vcInst.center_id];
	if (vc === undefined) {
		vc = new Array();
		oVCs[vcInst.center_id] = vc;
	}
	vc.push(vcInst);
	return vc.length-1;
}


/*
 * Get all vaccine centers for the given state-district, inturn for the given date.
 * date arg or db['date'] : the date for which vaccine centers should be looked up.
 */
async function dbget_vaccenters(db, stateId, districtId, date=null) {
	if (date === null) date = db['date'];
	try {
		let resp = await fetch(`${srvr}/v2/appointment/sessions/public/findByDistrict?district_id=${districtId}&date=${date}`, fetchOptions)
		let oVCInsts = await resp.json();
		var vacCenters = {};
		db.states[stateId].districts[districtId]['vaccenters'] = vacCenters;
		oVCInsts.sessions.forEach(vcInst => {
			_add2vaccenter(vacCenters, vcInst);
			//console.log("INFO:DbGetVacCenters:", vaccenter_string(vcInst, db.states[stateId].name, db.states[stateId].districts[districtId].name));
			});
	} catch(error) {
		console.error("ERRR:DbGetVacCenters:", error)
		update_status(`ERRR:DbGetVacCenters: ${error.message}`);
	}
}


function cache_not_fresh(db, stateId) {
	var prevTime = db.states[stateId].time;
	var prevDate = db.states[stateId].date;
	var curTime = Date.now()
	if ((prevDate !== undefined) && (prevDate != db.date)) {
		console.log("INFO:CacheNotFresh: Fetching bcas different date for", db.states[stateId].name);
		db.states[stateId]['time'] = curTime;
		db.states[stateId]['date'] = db.date;
		return false;
	}
	if (prevTime !== undefined) {
		deltaSecs = (curTime - prevTime)/1000
		if (deltaSecs < 300) {
			console.log("INFO:CacheNotFresh: Too soon for", db.states[stateId].name, deltaSecs);
			return true;
		}
		console.log("INFO:CacheNotFresh: Fetching fresh data for", db.states[stateId].name, deltaSecs);
	} else {
		console.log("INFO:CacheNotFresh: Fetching for 1st time for", db.states[stateId].name);
	}
	db.states[stateId]['time'] = curTime;
	db.states[stateId]['date'] = db.date;
	return false;
}


async function dbget_districts(db, stateId) {
	db.states[stateId]['districts'] = {};
	try {
		let resp = await fetch(`${srvr}/v2/admin/location/districts/${stateId}`, fetchOptions)
		let oDists = await resp.json()
		for(distK in oDists.districts) {
			let dist = oDists.districts[distK];
			db.states[stateId].districts[dist.district_id] = {};
			db.states[stateId].districts[dist.district_id]['name'] = dist.district_name;
			db.states[stateId].districts[dist.district_id]['district_id'] = dist.district_id;
			console.log("INFO:DbGetDistricts:", dist.district_id, dist.district_name);
			update_status(`INFO:DbGetDistricts: ${dist.district_name}`);
			await dbget_vaccenters(db, stateId, dist.district_id);
		}
	} catch(error) {
		console.error("ERRR:DbGetDistricts:", error)
		update_status(`ERRR:DbGetDistricts: ${error.message}`);
	}
}


/*
 * Get details about vaccine availability wrt specified list of states
 * db : the object which will contain the details
 * 	db['date'] : the date for which availability data should be fetched.
 * 	db['vaccine'] : the vaccine one is interested in.
 * states2Get : the list of states to get data for
 */
async function dbget_states(db, states2Get) {
	if (db['states'] === undefined) db['states'] = {};
	try {
		let resp = await fetch(`${srvr}/v2/admin/location/states`, fetchOptions)
		let data = await resp.json()
		for(stateK in data.states) {
			let state = data.states[stateK];
			console.log("INFO:DbGetStates:", state.state_id, state.state_name);
			update_status(`INFO:DbGetStates: ${state.state_name}`);
			let stateIndex = states2Get.findIndex((curState) => {
				if (state.state_name.toUpperCase() === curState.toUpperCase()) return true;
				return false;
				});
			if (stateIndex === -1) continue;
			let dbState = db.states[state.state_id];
			if (dbState === undefined) dbState = {};
			db.states[state.state_id] = dbState;
			db.states[state.state_id]['name'] = state.state_name;
			db.states[state.state_id]['state_id'] = state.state_id;
			if (cache_not_fresh(db, state.state_id)) continue;
			await dbget_districts(db, state.state_id);
		}
	} catch(error) {
		console.error("ERRR:DbGetStates:", error)
		update_status(`ERRR:DbGetStates: ${error.message}`);
	}
}


function dummy_update_status(msg) { };
if (typeof(update_status) === 'undefined') update_status = dummy_update_status;


if (typeof(exports) === 'undefined') exports = {};
exports.dbget_states = dbget_states;
exports.vaccenter_string = vaccenter_string;
exports.vaccenter_string_ex = vaccenter_string_ex;
exports.dblookup_vaccenters = dblookup_vaccenters;

