(() => {
	const socket = io();
	
	function postMessage(sender, color, message) {
		message = sender + ": " + message;
		$("#messageList").append(`<li style="color:${color};">` + message + "</li>");
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
	
	function updateConnectionStatus() {
		// use socket.connected boolean to visually notify user that connection is lost/regained
	};
	socket.on("disconnect", updateConnectionStatus);
	socket.on("reconnect", updateConnectionStatus);
	
	window.socket = socket;
})();