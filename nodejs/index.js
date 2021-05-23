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


function handle_vaccenter(db, sk, dk, vcInst, passedAlong) {
	state = db.states[sk];
	dist = state.districts[dk];
	console.log(cw.vaccenter_string(vcInst, state.name, dist.name));
}


handle_args(process.argv.slice(2));
var db = { 'date': gDate, 'vaccine': gVaccine };
cw.dbget_states(db, [ gState ]).then(() => {
	cw.dblookup_vaccenters(db, handle_vaccenter);
	console.log("INFO: Done");
	});

