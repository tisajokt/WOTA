(() => {
	var socket = io();
	function ready() {
		console.log("Socket ready.");
	};
	
	socket.on("userKey", (data) => {
		// debug
		// console.log(`Server sent ${data} in 'userKey' event.`);
		
		if (data == "ok") {
			ready();
		} else if (data == "req") {
			if (localStorage.userKey) {
				socket.emit("userKey", localStorage.userKey);
			} else {
				socket.emit("userKey", "req");
			}
		} else {
			localStorage.userKey = data;
			socket.emit("userKey", data);
		}
	});
	
	function updateConnectionStatus() {
		// use socket.connected boolean to visually notify user that connection is lost/regained
	};
	socket.on("disconnect", updateConnectionStatus);
	socket.on("reconnect", updateConnectionStatus);
	
	window.socket = socket;
})();