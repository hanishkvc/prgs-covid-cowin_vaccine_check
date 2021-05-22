/*
 * Query CoWin's Vaccine availability database, using its public api
 * HanishKVC, 2021
 * GPL
 */

fetch = require('node-fetch');
const cw = require('../browser/cowinner');
var gDate = null;
var gState = 'Kerala';


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
		i += 1;
	}
	if (gDate === null) {
		tDate = new Date();
		gDate = `${tDate.getDate()}-${tDate.getMonth()+1}-${tDate.getFullYear()}`;
	}
	gState = gState.toUpperCase();
	console.log(`INFO:State=${gState}:Date=${gDate}`);
}


handle_args(process.argv.slice(2));
var db = { 'date': gDate };
cw.dbget_states(db, [ gState ])

