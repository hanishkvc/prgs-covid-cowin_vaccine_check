/*
 * The main ui related logic to get data and show to user.
 * HanishKVC, 2021
 * GPL
 */


var elMainTbl = document.getElementById("maintbl");
var elState = document.getElementById("vstate");
var elDate = document.getElementById("vdate");
var elSearch = document.getElementById("vsearch");
var elVac = document.getElementById("vvac");
var elStatus = document.getElementById("status");
var gDate = "22-05-2021";
var gStates = [ "KERALA", "KARNATAKA" ];
var gVac = "ANY";
var db = null;


function div_append(el, text) {
	let tP = document.createElement("p");
	tP.textContent = text;
	el.appendChild(tP);
}


function tbl_clear(el, index, parts=[ "tbody", "thead"]) {
	parts.forEach((part) => {
		let tB = document.getElementsByTagName(part)[index];
		tB.innerHTML = "";
	});
}


function tbl_append(el, index, datas, part="tbody") {
	let tB = document.getElementsByTagName(part)[index];
	let tR = document.createElement("tr");
	datas.forEach((data) => {
		let tD = document.createElement("td");
		tD.textContent = data;
		tR.appendChild(tD);
	});
	tB.appendChild(tR);
}


function update_status(msg) {
	elStatus.innerHTML = msg;
}


function show_vcs(el, db) {
	tbl_append(el, 1, [ "Vaccine", "Dose1", "Dose2", "Name", "Pincode", "Dist", "State", "Age" ], "thead");
	dblookup_vaccenters(db, function(db, sk, dk, vc) {
		state = db.states[sk];
		dist = state.districts[dk];
		tbl_append(el, 1, [ vc.vaccine, vc.available_capacity_dose1, vc.available_capacity_dose2, vc.name, vc.pincode, dist.name, state.name, `${vc.min_age_limit}+` ]);
		});
}


function handle_statedone(db, stateId, type) {
	tP = document.getElementById("time");
	let dateTime = new Date(db.states[stateId].time);
	tP.textContent = `Availability status queried at ${dateTime} ie ${type}`;
}


function search_clicked(ev) {
	gStates = [ elState.value ];
	tDate = elDate.value.split('-');
	gDate = `${tDate[2]}-${tDate[1]}-${tDate[0]}`;
	gVac = elVac.value;
	console.log("INFO:SearchClicked:", gStates, gDate);
	tP = document.getElementById("states");
	tP.textContent = `Showing data for selected states: ${gStates}`;
	tbl_clear(elMainTbl, 1);
	db['date'] = gDate;
	db['vaccine'] = gVac;
	db['s_states'] = gStates;
	dbget_states(db)
		.then(() => {
			show_vcs(elMainTbl, db);
			update_status("Done");
		});
}


function start_here() {
	console.log("INFO:StartHere:...");
	db = {};
	db['cb_dbgetstates_statedone'] = handle_statedone;
	elSearch.onclick = search_clicked;
}


