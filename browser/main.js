/*
 * The main ui related logic to get data and show to user.
 * HanishKVC, 2021
 * GPL
 */


var elMainTbl = document.getElementById("maintbl");
var elState = document.getElementById("vstate");
var elDate = document.getElementById("vdate");
var elSearch = document.getElementById("vsearch");
var elStatus = document.getElementById("status");
var gDate = "22-05-2021";
var gStates = [ "KERALA", "KARNATAKA" ];


function div_append(el, text) {
	let tP = document.createElement("p");
	tP.textContent = text;
	el.appendChild(tP);
}


function tbl_clear(el, parts=[ "tbody", "thead"]) {
	parts.forEach((part) => {
		let tB = document.getElementsByTagName(part)[0];
		tB.innerHTML = "";
	});
}


function tbl_append(el, datas, part="tbody") {
	let tB = document.getElementsByTagName(part)[0];
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
	tbl_append(el, [ "Vaccine", "Qnty", "Name", "Pincode", "Dist", "State", "AgeGrp" ], "thead");
	for(stateK in db.states) {
		let state = db.states[stateK];
		for(distK in state.districts) {
			let dist = state.districts[distK];
			for(vcK in dist.vaccenters) {
				let vc = dist.vaccenters[vcK];
				tbl_append(el, [ vc.vaccine, vc.available_capacity, vc.name, vc.pincode, dist.name, state.name, vc.min_age_limit ]);
			}
		}
	}
}


function search_clicked(ev) {
	gStates = [ elState.value ];
	tDate = elDate.value.split('-');
	gDate = `${tDate[2]}-${tDate[1]}-${tDate[0]}`;
	console.log("INFO:SearchClicked:", gStates, gDate);
	tP = document.getElementById("time");
	tP.textContent = `Availability status queried at ${Date()}`;
	tP = document.getElementById("states");
	tP.textContent = `Showing data for selected states: ${gStates}`;
	tbl_clear(elMainTbl);
	db = { 'date': gDate };
	dbget_states(db, gStates)
		.then(() => {
			show_vcs(elMainTbl, db);
			update_status("Done");
		});
}


function start_here() {
	console.log("INFO:StartHere:...");
	elSearch.onclick = search_clicked;
}


