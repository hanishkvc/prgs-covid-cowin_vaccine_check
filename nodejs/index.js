/*
 * Query CoWin's Vaccine availability database, using its public api
 * HanishKVC, 2021
 * GPL
 */

fetch = require('node-fetch');
const cw = require('../browser/cowinner');

var db = { 'date': '22-05-2021' };
cw.dbget_states(db, [ 'KERALA' ])

console.log(db);

