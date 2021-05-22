/*
 * The main ui related logic to get data and show to user.
 * HanishKVC, 2021
 * GPL
 */


var elMain = document.getElementById("main");
var elState = document.getElementById("vstate");
var elDate = document.getElementById("vdate");
var elSearch = document.getElementById("vsearch");
var gDate = "22-05-2021";
var gStates = [ "KERALA", "KARNATAKA" ];


function show_vcs(el, db) {
	for(stateK in db.states) {
		let state = db.states[stateK];
		for(distK in state.districts) {
			let dist = state.districts[distK];
			for(vcK in dist.vaccenters) {
				let vc = dist.vaccenters[vcK];
				let tP = document.createElement("p");
				tP.textContent = `>>> ${vc.vaccine} ${vc.available_capacity} [${vc.name}, ${vc.pincode}, ${dist.name}, ${state.name}] for ${vc.min_age_limit}+`;
				el.appendChild(tP);
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
	db = { 'date': gDate };
	dbget_states(db, gStates)
		.then(() => {
			show_vcs(elMain, db);
		});
}


function start_here() {
	console.log("INFO:StartHere:...");
	elSearch.onclick = search_clicked;
}


