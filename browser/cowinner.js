/*
 * Module to help get data from cowin site, using the exposed pulbic api
 * HanishKVC, 2021
 * GPL
 */


const srvr = "https://cdn-api.co-vin.in/api";
var fetchOptions = {
	headers: {
		"User-Agent": "india-hkvc/20210522 node-fetch/202105"
		}
	}


function vaccenter_string(db, stateId, districtId, centerId) {
	//console.log("INFO:VacCenterString:", stateId, districtId, centerId);
	let sLocation = `${db.states[stateId].name} ${db.states[stateId].districts[districtId].name}`;
	vc = db.states[stateId].districts[districtId].vaccenters[centerId];
	let sVC = `${vc.vaccine} ${vc.available_capacity} -- ${vc.name} ${vc.pincode} -- ${vc.min_age_limit}+`;
	return `${sLocation} -- ${sVC}`;
}


/*
 * Look at vaccine centers with vaccine availability in the given db.
 * db.vaccine
 * 	if defined, then return vaccenter's which have that vaccine.
 * 	if ANY/null/undefined all vaccine types will be selected.
 * The callback will be called for any valid vaccenters'.
 *	passAlong will be passed to the callback.
 *	Args: stateId, districtId, vaccenterId, passAlong
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
		state = db.states[sk];
		for(dk in state.districts) {
			dist = state.districts[dk];
			for(vk in dist.vaccenters) {
				vc = dist.vaccenters[vk];
				if ((vacType !== null) && (vacType !== vc.vaccine.toUpperCase())) continue;
				if (vc.available_capacity === 0) continue;
				callback(db, sk, dk, vk, passAlong);
			}
		}
	}
}


/*
 * Get all vaccine centers for the given state-district, inturn for the given date.
 * date arg or db['date'] : the date for which vaccine centers should be looked up.
 */
async function dbget_vaccenters(db, stateId, districtId, date=null) {
	if (date === null) date = db['date'];
	try {
		let resp = await fetch(`${srvr}/v2/appointment/sessions/public/findByDistrict?district_id=${districtId}&date=${date}`, fetchOptions)
		let oVCs = await resp.json();
		var vacCenters = {};
		oVCs.sessions.forEach(vc => {
			vacCenters[vc.center_id] = vc;
			/*
			console.log("INFO:DbGetVacCenters:", vaccenter_string(db, stateId, districtId, vc.center_id));
			*/
			});
		db.states[stateId].districts[districtId]['vaccenters'] = vacCenters;
	} catch(error) {
		console.error("ERRR:DbGetVacCenters:", error)
		update_status(`ERRR:DbGetVacCenters: ${error.message}`);
	}
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
	db['states'] = {};
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
			db.states[state.state_id] = {};
			db.states[state.state_id]['name'] = state.state_name;
			db.states[state.state_id]['state_id'] = state.state_id;
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
exports.dblookup_vaccenters = dblookup_vaccenters;

