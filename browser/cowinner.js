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


/*
 * Get Vaccine centers with required availability for the given state-district,
 * inturn for the given date.
 * date arg or db['date'] : the date for which vaccine centers should be looked up.
 * db['vaccine'] : the vaccine one is interested in. If not specified, all vaccine
 * 	types will be selected.
 */
async function dbget_vaccenters(db, stateId, districtId, date=null) {
	if (date === null) date = db['date'];
	var vacType = db['vaccine'];
	if (vacType === undefined) vacType = null;
	try {
		let resp = await fetch(`${srvr}/v2/appointment/sessions/public/findByDistrict?district_id=${districtId}&date=${date}`, fetchOptions)
		let oVCs = await resp.json();
		var vacCenters = {};
		oVCs.sessions.forEach(vc => {
			if (vc.available_capacity === 0) return;
			//if ((vacType !== undefined) && (vc.vaccine.toUpperCase() !== vacType.toUpperCase())) return;
			if ((vacType !== null) && (vc.vaccine.toUpperCase() !== vacType.toUpperCase())) return;
			vacCenters[vc.name] = vc;
			let sLocation = `${db.states[stateId].name} ${db.states[stateId].districts[districtId].name}`;
			let sVC = `${vc.vaccine} ${vc.available_capacity} -- ${vc.name} ${vc.pincode} -- ${vc.min_age_limit}+`;
			console.log(`INFO:DbGetVacCenters: ${sLocation} -- ${sVC}`);
			});
		db.states[stateId].districts[districtId]['vaccenters'] = vacCenters;
	} catch(error) {
		console.error("ERRR:DbGetVacCenters:", error)
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
			console.log("INFO:DbGetDistricts:", dist.district_id, dist.district_name);
			await dbget_vaccenters(db, stateId, dist.district_id);
		}
	} catch(error) {
		console.error("ERRR:DbGetDistricts:", error)
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
			let stateIndex = states2Get.findIndex((curState) => {
				if (state.state_name.toUpperCase() === curState.toUpperCase()) return true;
				return false;
				});
			if (stateIndex === -1) continue;
			db.states[state.state_id] = {};
			db.states[state.state_id]['name'] = state.state_name;
			await dbget_districts(db, state.state_id);
		}
	} catch(error) {
		console.error("ERRR:DbGetStates:", error)
	}
}


exports.dbget_states = dbget_states;


