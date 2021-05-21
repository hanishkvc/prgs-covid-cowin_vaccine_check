
const srvr = "https://cdn-api.co-vin.in/api";
var goStates = null;
var elMain = document.getElementById("main");


function get_states(el) {
	fetch(`${srvr}/v2/admin/location/states`)
		.then(resp => resp.json())
		.then((data) => {
			goStates = data;
			goStates.states.forEach(state => {
				tP = document.createElement("p");
				tP.textContent = `[${state.state_id}] ${state.state_name}`;
				el.appendChild(tP);
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

