/*
 * The main ui related logic to get data and show to user.
 * HanishKVC, 2021
 * GPL
 */


var elMainTbl = document.getElementById("maintbl");
var elState = document.getElementById("vstate");
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
	tbl_append(el, 1, [ "Vaccine", "Dose1", "Dose2", "Name", "Pincode", "Dist", "State", "Age" ], "thead");
	dblookup_vaccenters(db, function(db, sk, dk, vc) {
		state = db.states[sk];
		dist = state.districts[dk];
		tbl_append(el, 1, [ vc.vaccine, vc.available_capacity_dose1, vc.available_capacity_dose2, vc.name, vc.pincode, dist.name, state.name, `${vc.min_age_limit}+` ]);
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
			msg = `State: ${db.s_states}, Date: ${db.date}, Vac: ${db.vaccine}, Cnt: ${db.vacCnt}, NumOfVacCenters: ${db.vcCnt}`
			notTitle = `Vac: ${db.vaccine}, Qty: ${db.vacCnt}, VacCenters: ${db.vcCnt}`
			notBody = `State: ${db.s_states}, Date: ${db.date}`
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
}


function search_clicked(ev) {
	get_searchparams();
	var bNotifyMode = false;
	if (ev === null) bNotifyMode = true;
	do_search(bNotifyMode);
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
		gAutoId = setInterval(search_clicked, 10*60*1000, null);
		elAuto.textContent = "Stop Auto";
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


function start_here() {
	console.log("INFO:StartHere:...");
	db = {};
	db['bNotifyMe'] = false;
	db['cb_dbgetstates_statedone'] = handle_statedone;
	elSearch.onclick = search_clicked;
	elAuto.onclick = auto_clicked;
	elNotify.onclick = notify_clicked;
}


