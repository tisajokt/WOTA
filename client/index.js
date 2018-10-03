
(() => {
	const socket = io();
	
	function pad(numberString, places) {
		numberString = numberString.toString();
		if (numberString.length < places) {
			return "0".repeat(places - numberString.length) + numberString;
		} else {
			return numberString;
		}
	};
	function postMessage(sender, color, message) {
		message = sender + ": " + message;
		var now = new Date(Date.now());
		var timestamp = now.getHours() + ":" + pad(now.getMinutes(), 2) + ":" + pad(now.getSeconds(), 2);
		$("#messageList").append(`<li style="color:${color};"><span title="${timestamp}">` + message + "</span></li>");
	};
	window.postMessage = postMessage;
	
	function ready() {
		console.log("Socket ready.");
	};
	
	$("#messageForm").submit(() => {
		var message = $("#messageInput").val();
		
		console.log(`Sending chat message "${message}" to server.`);
		socket.emit("chat", message);
		
		// Clear message field
		$("#messageInput").val("");
		
		// Returning false prevents page from reloading on form submission - supposedly?
		return false;
	});
	
	socket.on("chat", postMessage);
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
	
	function updateConnectionStatus(status) {
		// use socket.connected boolean to visually notify user that connection is lost/regained
		postMessage("Server", "#555", `Connection to server ${status}.`);
	};
	socket.on("disconnect", () => {
		updateConnectionStatus("lost");
	});
	socket.on("reconnect", () => {
		updateConnectionStatus("regained");
	});
	
	window.socket = socket;
})();
