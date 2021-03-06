/*
 * The main ui related logic to get data and show to user.
 * HanishKVC, 2021
 * GPL
 */


var elMainTbl = document.getElementById("maintbl");
var elState = document.getElementById("vstate");
var elDistrict = document.getElementById("vdistrict");
var elDate = document.getElementById("vdate");
var elNotify = document.getElementById("vnotify");
var elSearch = document.getElementById("vsearch");
var elAuto = document.getElementById("vauto");
var elVac = document.getElementById("vvac");
var elStatus = document.getElementById("status");
var elStatusAlert = document.getElementById("statusalert");
var ghErrorStatus = elStatusAlert
var gDate = "22-05-2021";
var gStates = [ "KERALA", "KARNATAKA" ];
var gVac = "ANY";
var db = null;
var gAutoId = 0;
const AUTO_INTERVAL = 10;
var gAutoCntDown = AUTO_INTERVAL;


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


function select_clear(el) {
	let numOptions = el.length;
	for(i=0; i < numOptions; i++) {
		el.remove(0);
	}
}


function select_fromdb(el, acha, key) {
	let to = document.createElement("option");
	to.textContent = "ANY";
	el.add(to);
	for(ck in acha[key]) {
		to = document.createElement("option");
		to.textContent = acha[key][ck].name;
		el.add(to);
	}
}


function update_status(msg, el=elStatus) {
	el.innerHTML = msg;
}


async function notify_getperm() {
	if (!("Notification" in window)) {
		console.error("WARN:NotifyGetPerm: Browser doesnt support notification");
		return false;
	}
	console.log(`INFO:NotifyGetPerm: Notification.Permission: ${Notification.permission}`);
	if (Notification.permission != "granted") {
		await Notification.requestPermission();
	}
	return true;
}


function notify_user(title, body) {
	msg = `${title} ${body}`
	if (!("Notification" in window)) {
		console.error("WARN:NotifyUser: Browser doesnt support notification:", msg);
		return;
	}
	if (Notification.permission == "granted") {
		console.log("INFO:NotifyUser:", msg);
		new Notification(title, { 'body': body });
	} else {
		console.log("INFO:NotifyUser:Skipping:", msg);
	}
}


function show_vcs(el, db) {
	tbl_append(el, 1, [ "Vaccine", "Dose1", "Dose2", "Name", "Pincode", "Dist", "State", "Age", "Date" ], "thead");
	dblookup_vaccenters(db, function(db, sk, dk, vc) {
		state = db.states[sk];
		dist = state.districts[dk];
		tbl_append(el, 1, [ vc.vaccine, vc.available_capacity_dose1, vc.available_capacity_dose2, vc.name, vc.pincode, dist.name, state.name, `${vc.min_age_limit}+`, vc.date ]);
		});
}


function handle_statedone(db, stateId, type) {
	tP = document.getElementById("time");
	let dateTime = new Date(db.GetVCsFetchTime);
	tP.textContent = `Oldest local-${type} data queried at ${dateTime}`;
}


function do_search(bNotifyMode) {
	update_status("Search started...");
	update_status("Vasudhaiva Kutumbakam", elStatusAlert);
	tbl_clear(elMainTbl, 1);
	dbget_vcs(db)
		.then(() => {
			show_vcs(elMainTbl, db);
			notTitle = `Vac: ${db.vaccine}, Qty: ${db.vacCnt}, VacCenters: ${db.vcCnt}`
			let tDistrict = db.s_districts ? db.s_districts : 'ANY';
			let tAge = db.s_age ? db.s_age : 'ANY';
			notBody = `State: ${db.s_states}, Dist: ${tDistrict}, Date: ${db.date}, SType: ${db.s_type}, Age: ${tAge}`
			msg = notTitle + ", " + notBody;
			update_status("Done: "+msg);
			if (bNotifyMode && db.bNotifyMe) notify_user(notTitle, notBody);
		});
}


function get_searchparams() {
	gStates = [ elState.value ];
	tDate = elDate.value.split('-');
	gDate = `${tDate[2]}-${tDate[1]}-${tDate[0]}`;
	gVac = elVac.value;
	console.log("INFO:SearchParams:", gStates, gDate, gVac);
	tP = document.getElementById("location");
	tP.textContent = `Showing data for: ${gStates}`;
	db['date'] = gDate;
	db['vaccine'] = gVac;
	db['s_states'] = gStates;
	if (elDistrict.value !== 'ANY') {
		db['s_type'] = STYPE_DISTRICT1WEEK;
		db['s_districts'] = [ elDistrict.value ];
	} else {
		db['s_type'] = STYPE_STATE1DAY;
		db['s_districts'] = undefined;
	}
}


function state_changed(ev) {
	let tState = elState.value;
	_dbget_states(db).then(() => {
		let stateId = db_stateid(db, tState);
		if (stateId === -1) {
			update_status(`ERRR: Unknown State ${tState}, OR check internet connection`, elStatusAlert);
			return;
		}
		_dbget_districts(db, stateId).then(() => {
			select_clear(elDistrict);
			select_fromdb(elDistrict, db.states[stateId], 'districts');
			});
		});
}


function _today() {
	let oDate = new Date();
	let tYear = oDate.getFullYear();
	let tMonth = oDate.getMonth()+1;
	if (tMonth < 10) tMonth = `0${tMonth}`;
	let tDate = oDate.getDate();
	if (tDate < 10) tDate = `0${tDate}`;
	let sDate = `${tYear}-${tMonth}-${tDate}`;
	return sDate;
}


function district_changed(ev) {
	if (elDistrict.value !== 'ANY') {
		// For now reset the date to today for District 1Week kind of search
		elDate.value = _today();
		update_status(`INFO: Date reset to today ${elDate.value}, change if needed`, elStatusAlert);
	}
}


function search_clicked(ev) {
	get_searchparams();
	var bNotifyMode = false;
	if (ev === null) bNotifyMode = true;
	do_search(bNotifyMode);
}


function auto_cb() {
	gAutoCntDown -= 1;
	if (gAutoCntDown <= 0) {
		search_clicked(null);
		gAutoCntDown = AUTO_INTERVAL;
	}
	update_status(`INFO: ${gAutoCntDown} mins till next auto repeat search`);
	elAuto.textContent = `Stop Auto(${gAutoCntDown})`;
}


function auto_clicked(ev) {
	search_clicked(ev); // ev will be wrong, but is fine for now.
	if (gAutoId) {
		update_status("Stopped auto repeating search");
		clearInterval(gAutoId);
		gAutoId = 0;
		elAuto.textContent = "Start Auto";
	} else {
		get_searchparams();
		update_status("Started auto repeating search");
		gAutoCntDown = AUTO_INTERVAL;
		gAutoId = setInterval(auto_cb, 1*60*1000, null);
		elAuto.textContent = `Stop Auto(${gAutoCntDown})`;
	}
}


function notify_clicked(ev) {
	if (db.bNotifyMe) {
		db.bNotifyMe = false;
		elNotify.textContent = "Start NotifyMe"
	} else {
		notify_getperm().then((notifyThere) => {
			if (!notifyThere) {
				elNotify.textContent = "No Notifications";
			} else {
				db.bNotifyMe = true;
				elNotify.textContent = "Stop NotifyMe"
			}
		});
	}
}


function handle_searchparams(db) {
	let tURL = new URL(document.location);
	let searchAge = tURL.searchParams.get('age');
	if (searchAge !== null) db['s_age'] = Number(searchAge);
}


function start_here() {
	console.log("INFO:StartHere:...");
	db = {};
	db['bNotifyMe'] = false;
	db['cb_dbgetstates_statedone'] = handle_statedone;
	handle_searchparams(db);
	elDate.value = _today();
	elSearch.onclick = search_clicked;
	elAuto.onclick = auto_clicked;
	elNotify.onclick = notify_clicked;
	elState.onchange = state_changed;
	elDistrict.onchange = district_changed;
}


