/*
 * Query CoWin's Vaccine availability database, using its public api
 * HanishKVC, 2021
 * GPL
 */

fetch = require('node-fetch');
const cw = require('../browser/cowinner');
const hlpr = require('./hlpr');
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
	msg = hlpr.str_ofvalues([10,16,24,32,12,8,8], [vcInst.date, state.name, dist.name, vcInst.name, vcInst.vaccine, vcInst.available_capacity_dose1, vcInst.available_capacity_dose2]);
	console.log(msg);
	//console.log(cw.vaccenter_string(vcInst, state.name, dist.name));
}


handle_args(process.argv.slice(2));
var db = { 'date': gDate, 'vaccine': gVaccine, 's_states': [ gState ] };
cw.dbget_state_vcs(db).then(() => {
	cw.dblookup_vaccenters(db, handle_vaccenter);
	console.log(`INFO: Done:VacCentersWithVacs: State: ${db.s_states}, Date: ${db.date}, Vaccine ${db.vaccine}, Qty: ${db.vacCnt}, VacCenters: ${db.vcCnt}`);
	});

