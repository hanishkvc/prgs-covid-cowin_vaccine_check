/*
 * Query CoWin's Vaccine availability database, using its public api
 * HanishKVC, 2021
 * GPL
 */

fetch = require('node-fetch');
const cw = require('../browser/cowinner');
var gDate = null;
var gState = 'Kerala';
var gVaccine = null;


function handle_args(cmdArgs) {
	for(i=0; i < cmdArgs.length;) {
		if (cmdArgs[i] === '--state') {
			gState = cmdArgs[i+1];
			i += 1;
		}
		if (cmdArgs[i] === '--date') {
			gDate = cmdArgs[i+1];
			i += 1;
		}
		if (cmdArgs[i] === '--vaccine') {
			gVaccine = cmdArgs[i+1];
			i += 1;
		}
		i += 1;
	}
	if (gDate === null) {
		tDate = new Date();
		gDate = `${tDate.getDate()}-${tDate.getMonth()+1}-${tDate.getFullYear()}`;
	}
	gState = gState.toUpperCase();
	console.log(`INFO:State=${gState}:Date=${gDate}:Vaccine=${gVaccine}`);
}


function list_vaccenters(db) {
	let vacType = db.vaccine;
	if (vacType === undefined) {
		vacType = null;
	} else if (vacType !== null) {
		vacType = vacType.toUpperCase();
		if (vacType === 'ANY') vacType = null;
	}
	db.states.forEach((state) => {
		state.districts.forEach((dist) => {
			dist.vaccenters.forEach((vc) => {
				if ((vacType !== null) && (vacType !== vc.vaccine.toUpperCase())) return;
				if (vc.available_capacity === 0) return;
				console.log(cw.vaccenter_string(state.state_id, dist.district_id, vc.center_id));
			});
		});
	});
}


handle_args(process.argv.slice(2));
var db = { 'date': gDate, 'vaccine': gVaccine };
cw.dbget_states(db, [ gState ]).then(() => {
	list_vaccenters(db);
	console.log("INFO: Done");
	});

