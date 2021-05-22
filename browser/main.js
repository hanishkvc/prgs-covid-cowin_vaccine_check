
const srvr = "https://cdn-api.co-vin.in/api";
var goStates = null;
var elMain = document.getElementById("main");
var gDate = "22-05-2021";
var gStates = [ "KERALA", "KARNATAKA" ];
var gbShowDistrictHeader = false;


function get_vaccenters(el, districtId, districtName, date=null) {
	if (date === null) date = gDate;
	fetch(`${srvr}/v2/appointment/sessions/public/findByDistrict?district_id=${districtId}&date=${date}`)
		.then(resp => resp.json())
		.then((oVCs) => {
			oVCs.sessions.forEach(vc => {
				if (vc.available_capacity === 0) return;
				let tP = document.createElement("p");
				tP.textContent = `>>> ${vc.vaccine} ${vc.available_capacity} [${vc.name}, ${vc.pincode}, ${districtName}] for ${vc.min_age_limit}+`;
				el.appendChild(tP);
			});
		})
		.catch((error) => {
			console.error(error)
			el.innerHTML = "<h2>ERROR:Fetching Vaccine centers</h2>";
		});
}


function get_districts(stateId, el) {
	fetch(`${srvr}/v2/admin/location/districts/${stateId}`)
		.then(resp => resp.json())
		.then((oDists) => {
			oDists.districts.forEach(dist => {
				if (gbShowDistrictHeader) {
					let tP = document.createElement("p");
					tP.textContent = `>>> [${dist.district_id}] ${dist.district_name}`;
					el.appendChild(tP);
				}
				let tChild = document.createElement("div");
				el.appendChild(tChild);
				get_vaccenters(tChild, dist.district_id, dist.district_name);
			});
		})
		.catch((error) => {
			console.error(error)
			el.innerHTML = "<h2>ERROR:Fetching Districts</h2>";
		});
}


function get_states(el) {
	fetch(`${srvr}/v2/admin/location/states`)
		.then(resp => resp.json())
		.then((data) => {
			goStates = data;
			goStates.states.forEach(state => {
				let stateIndex = gStates.findIndex((curState) => {
					if (state.state_name.toUpperCase() === curState) return true;
					return false;
					});
				if (stateIndex === -1) return;
				let tP = document.createElement("p");
				tP.textContent = `[${state.state_id}] ${state.state_name}`;
				el.appendChild(tP);
				let tChild = document.createElement("div");
				el.appendChild(tChild);
				get_districts(state.state_id, tChild);
			});
		})
		.catch((error) => {
			console.error(error)
			el.innerHTML = "<h2>ERROR:Fetching States</h2>";
		});
}


function start_here() {
	tP = document.getElementById("time");
	tP.textContent = `Availability status queried at ${Date()}`;
	tP = document.getElementById("states");
	tP.textContent = `Showing data for selected states: ${gStates}`;
	get_states(elMain);
}


start_here();
