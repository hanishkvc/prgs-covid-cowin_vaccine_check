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
 * 			date (there could be multiple such dates)
 * 				vaccenters (bunch of vaccine center objects)
 * 					vaccenterInstances (kind of array of same vaccine center instances)
 * 						center_id
 *	 					name
 * 						available_capacity
 * 						...
 * 						NOTE: As each vaccine center could provide different vaccines
 * 						to different age group people, so each such unique combination
 * 						will be treated as a vcInstance.
 * 							Ex: VC1_45+_Covishield, VC1_18+_Covishield, VC1_45+_Covaxin, ...
 *
 */


const STYPE_STATE1DAY = "STATE_1DAY"
const STYPE_DISTRICT1WEEK = "DISTRICT_1WEEK"


const srvr = "https://cdn-api.co-vin.in/api";
var fetchOptions = {
	headers: {
		"User-Agent": "india-hkvc/20210526.01 node-fetch/202105"
		}
	}


function cowinner_init() {
	// If browser, then it wont have process object by default, while window object will be defined
	if (typeof(window) === "undefined") {
		if (typeof(process) === "undefined") {
			console.log("INFO:CoWinner: Running in unknown context");
		} else {
			hlpr = require('../browser/hlpr');
			strlist_findindex = hlpr.strlist_findindex;
			console.log(`INFO:CoWinner: Running in node [${process.title} ${process.version}]`);
		}
	} else {
		if (typeof(navigator) === "undefined") {
			console.log("INFO:CoWinner: Running in a browser (maybe)");
		} else {
			console.log(`INFO:CoWinner: Running in browser [${navigator.userAgent}]`);
		}
		fetchOptions = { }
	}
}
cowinner_init();


/*
 * Get the list of states in CoWin system
 */
async function _get_states() {
	let resp = await fetch(`${srvr}/v2/admin/location/states`, fetchOptions)
	let data = await resp.json()
	return data;
}


/*
 * Get the list of districts wrt a specified stateId in CoWin system
 */
async function _get_districts(stateId) {
	let resp = await fetch(`${srvr}/v2/admin/location/districts/${stateId}`, fetchOptions)
	let data = await resp.json()
	return data;
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
	let vc = db.states[stateId].districts[districtId][db.date].vaccenters[vcenterId];
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
	let minCapacity = db.minCapacity
	if (minCapacity === undefined) minCapacity = 1;
	db['vcCnt'] = 0;
	db['vacCnt'] = 0;
	if (vacType === undefined) {
		vacType = null;
	} else if (vacType !== null) {
		vacType = vacType.toUpperCase();
		if (vacType === 'ANY') vacType = null;
	}
	for(sk in db.states) {
		let state = db.states[sk];
		if (strlist_findindex(db.s_states, state.name) === -1) continue;
		for(dk in state.districts) {
			let dist = state.districts[dk];
			if ((db.s_districts !== undefined) && (strlist_findindex(db.s_districts, dist.name) === -1)) continue;
			for(k in dist) {
				//console.log("DBUG:DBLookupVCs:", state.name, dist.name, k);
				if (dist[k] === undefined) continue;
				if (dist[k].vaccenters === undefined) continue;
				if ((db.s_type === STYPE_STATE1DAY) && (k !== db.date)) continue;
				for(vk in dist[k].vaccenters) {
					let vc = dist[k].vaccenters[vk];
					//console.log(vc);
					for(ik in vc) {
						vcInst = vc[ik];
						if ((vacType !== null) && (vacType !== vcInst.vaccine.toUpperCase())) continue;
						if (vcInst.available_capacity < minCapacity) continue;
						callback(db, sk, dk, vcInst, passAlong);
						db['vcCnt'] += 1;
						db['vacCnt'] += vcInst.available_capacity;
					}
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
async function dbget_vaccenters_fordate(db, stateId, districtId, date=null) {
	if (date === null) date = db['date'];
	let theDist;
	try {
		theDist = db.states[stateId].districts[districtId][date];
		if (theDist === undefined) {
			db.states[stateId].districts[districtId][date] = {}
			theDist = db.states[stateId].districts[districtId][date];
		}
		if (cache_not_fresh(theDist, 'DBGetVCs4Date', `${db.states[stateId].districts[districtId].name}:${date}`)) {
			db.GetVCsFetchStatus = "CACHED";
			if (db.GetVCsFetchTime > theDist.time) db.GetVCsFetchTime = theDist.time;
			return;
		}
		let resp = await fetch(`${srvr}/v2/appointment/sessions/public/findByDistrict?district_id=${districtId}&date=${date}`, fetchOptions)
		let oVCInsts = await resp.json();
		var vacCenters = {};
		db.states[stateId].districts[districtId][date]['vaccenters'] = vacCenters;
		oVCInsts.sessions.forEach(vcInst => {
			_add2vaccenter(vacCenters, vcInst);
			//console.log("INFO:DbGetVacCenters:", vaccenter_string(vcInst, db.states[stateId].name, db.states[stateId].districts[districtId].name));
			});
	} catch(error) {
		update_status(`ERRR:DbGetVCs4Date: ${error.message}`, ghErrorStatus);
		theDist.time = undefined;
	}
}


/*
 * Get all vaccine centers for the given state-district, inturn for next 7 days,
 * provided the corresponding data is availabe on cowin server, at the time of query.
 * date arg or db['date'] : the date from which vaccine centers should be looked up.
 */
async function dbget_vaccenters_forweek(db, stateId, districtId, date=null) {
	if (date === null) date = db['date'];
	try {
		let cacheTimeKey = `ctime_${date}`;
		if (cache_not_fresh(db.states[stateId].districts[districtId], 'DBGetVCs4Week', `${db.states[stateId].districts[districtId].name}:${date}`, cacheTimeKey)) {
			db.GetVCsFetchStatus = "CACHED";
			let theDist = db.states[stateId].districts[districtId];
			if (db.GetVCsFetchTime > theDist.time) db.GetVCsFetchTime = theDist.time;
			return;
		}
		let resp = await fetch(`${srvr}/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${date}`, fetchOptions)
		let oVCInsts = await resp.json();
		oVCInsts.centers.forEach(vc => {
			//console.log(vc.name);
			let sessions = vc.sessions;
			delete(vc.sessions);
			sessions.forEach(vcInst => {
				console.log(`DBUG:GetVCs4Week:1:${vc.center_id}, ${vc.name}, ${vcInst.date} [${vc.date}], ${vcInst.min_age_limit}+`);
				let lVC = Object.assign({}, vc);
				lVC = Object.assign(lVC, vcInst);
				if (db.states[stateId].districts[districtId][lVC.date] === undefined) {
					db.states[stateId].districts[districtId][lVC.date] = {};
					db.states[stateId].districts[districtId][lVC.date]['vaccenters'] = {};
				}
				let vacCenters = db.states[stateId].districts[districtId][lVC.date]['vaccenters'];
				_add2vaccenter(vacCenters, lVC);
				});
			});
		var vacCenters = {};
	} catch(error) {
		db.states[stateId].districts[districtId].time = undefined;
		update_status(`ERRR:DbGetVCs4Week: ${error.message}`, ghErrorStatus);
	}
}


function cache_not_fresh(acha, from, forMe, timeKey='time') {
	var prevTime = acha[timeKey];
	var curTime = Date.now()
	if (prevTime !== undefined) {
		deltaSecs = (curTime - prevTime)/1000
		if (deltaSecs < 300) {
			console.log(`INFO:CacheNotFresh:${from}: Too soon for ${forMe}: ${deltaSecs}`);
			return true;
		}
		console.log(`INFO:CacheNotFresh:${from}: Fetching fresh data for ${forMe}: ${deltaSecs}`);
	} else {
		console.log(`INFO:CacheNotFresh:${from}: Fetching fresh data for ${forMe}`);
	}
	acha[timeKey] = curTime;
	return false;
}


async function _dbget_districts(db, stateId) {
	if (db.states[stateId]['districts'] === undefined) db.states[stateId]['districts'] = {};
	try {
		if (cache_not_fresh(db.states[stateId], '_DBGetDists', db.states[stateId].name)) return;
		let oDists = await _get_districts(stateId);
		for(distK in oDists.districts) {
			let dist = oDists.districts[distK];
			if (db.states[stateId].districts[dist.district_id] === undefined) db.states[stateId].districts[dist.district_id] = {};
			db.states[stateId].districts[dist.district_id]['name'] = dist.district_name;
			db.states[stateId].districts[dist.district_id]['district_id'] = dist.district_id;
			//update_status(`INFO:_DbGetDistricts: ${dist.district_id} ${dist.district_name}`);
		}
	} catch(error) {
		db.states[stateId].time = undefined;
		update_status(`ERRR:_DbGetDistricts: ${error.message}`, ghErrorStatus);
	}
}


async function _dbget_states(db) {
	if (db['states'] === undefined) db['states'] = {};
	try {
		if (cache_not_fresh(db, '_DBGetStates', 'India')) return;
		let data = await _get_states();
		for(stateK in data.states) {
			let state = data.states[stateK];
			//update_status(`INFO:_DbGetStates: ${state.state_id} ${state.state_name}`);
			let dbState = db.states[state.state_id];
			if (dbState === undefined) dbState = {};
			db.states[state.state_id] = dbState;
			db.states[state.state_id]['name'] = state.state_name;
			db.states[state.state_id]['state_id'] = state.state_id;
		}
	} catch(error) {
		db.time = undefined;
		update_status(`ERRR:_DbGetStates: ${error.message}`, ghErrorStatus);
	}
}


function db_stateid(db, stateName) {
	if (db.states === undefined) return -1;
	for(k in db.states) {
		if (db.states[k].name === stateName) return db.states[k].state_id;
	}
	return -1;
}


/*
 * Get details about vaccine availability wrt specified list of states
 * db : the object which will contain the details
 * 	db['s_states'] : operate wrt these states only, if provided.
 * 	db['date'] : the date for which availability data should be fetched.
 * 	db['vaccine'] : the vaccine one is interested in.
 * 	db['s_type'] : Specify which set of VCs with available slots as captured
 * 		in the cowin system, as of the time of the query to get.
 * 		'STATE_1DAY' : Get suitable VCs across full state for 1 day
 * 		'DISTRICT_1WEEK' : Get suitable VCs for given district for 1 week.
 * 	db['s_districts'] : operate wrt these districts only, if provided.
 * 		If same district name in more than one state, and inturn if such a
 * 		combination of states and districts is provided, it will select
 * 		such districts wrt all states which have matching district.
 * NOTE: Caching of VCs data at the district level to help avoid loading the
 * cowin server to some extent, is handled only for STATE_1DAY type queries.
 */
async function dbget_vcs(db) {
	db['GetVCsFetchStatus'] = "FRESH";
	db['GetVCsFetchTime'] = Date.now();
	var states2Get = db['s_states'];
	var dists2Get = db['s_districts'];
	if (db['s_type'] === undefined) db['s_type'] = STYPE_STATE1DAY;
	var sType = db['s_type'];
	try {
		await _dbget_states(db);
		for(stateK in db.states) {
			let state = db.states[stateK];
			update_status(`INFO:DbGetVCs:State: ${state.state_id} ${state.name}`);
			if (states2Get !== undefined) {
				if (strlist_findindex(states2Get, state.name) === -1) continue;
			}
			await _dbget_districts(db, state.state_id);
			for(distK in state.districts) {
				let dist = state.districts[distK];
				if (dists2Get !== undefined) {
					if (strlist_findindex(dists2Get, dist.name) === -1) continue;
				}
				update_status(`INFO:DbGetVCs:District: ${dist.district_id} ${dist.name}`);
				if (sType === STYPE_STATE1DAY)
					await dbget_vaccenters_fordate(db, state.state_id, dist.district_id);
				else
					await dbget_vaccenters_forweek(db, state.state_id, dist.district_id);
			}
			let cb = db.cb_dbgetstates_statedone;
			if (cb !== undefined) cb(db, state.state_id, db.GetVCsFetchStatus);
		}
	} catch(error) {
		update_status(`ERRR:DbGetVCs: ${error.message}`, ghErrorStatus);
		console.error(error);
	}
}


function _update_status(msg) {
	console.log(msg);
}


if (typeof(update_status) === 'undefined') update_status = _update_status;
if (typeof(ghErrorStatus) === 'undefined') ghErrorStatus = null;


if (typeof(exports) === 'undefined') exports = {};
exports.dbget_vcs = dbget_vcs;
exports.vaccenter_string = vaccenter_string;
exports.vaccenter_string_ex = vaccenter_string_ex;
exports.dblookup_vaccenters = dblookup_vaccenters;

