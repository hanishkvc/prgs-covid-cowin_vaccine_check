
const srvr = "https://cdn-api.co-vin.in/api";
var goStates = null;
var elMain = document.getElementById("main");


function get_districts(stateId, el) {
	fetch(`${srvr}/v2/admin/location/districts/${stateId}`)
		.then(resp => resp.json())
		.then((oDists) => {
			oDists.districts.forEach(dist => {
				let tP = document.createElement("p");
				tP.textContent = `+ [${dist.district_id}] ${dist.district_name}`;
				el.appendChild(tP);
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
	elMain.innerHTML = "JS Started";
	get_states(elMain);
}


start_here();

