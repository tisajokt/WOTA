(() => {
	var socket = io();
	console.log("Socket created successfully.");
	
	window.socket = socket;
})();