
// Creates server
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const path = require("path");
const fs = require("fs");

const config = require("./config.json");
const sockets = {};
const listeners = {};

const env = {
	config: config,
	sockets: sockets
};

// All files in /server/listeners are loaded as modules into the listeners object.
// Their first argument (env) is bound to the env variable in app.js.
fs.readdirSync("./listeners/").forEach((event) => {
	listeners[event.split(".")[0]] = require("./listeners/" + event).bind(null, env);
});

// All requests serve within the /client directory, ex. www.website.com/js/script1.js would serve /client/js/script1.js.
// path.join is used to properly resolve ".."
app.use("/", express.static(path.join(__dirname, "../client")));

server.listen(config.port, () => {
	console.log(`Started WOTA server, listening on port ${port}.`);
});

function onSocketConnection(socket) {
	sockets[socket.id] = socket;
	console.log(`A user connected, ${socket.id}.`);
	
	// When a socket connects, it's set to listen to all events as defined in /server/listeners.
	// Their second argument (socket) is bound to the socket variable.
	// The second argument is bound instead of the first, because the first was already bound in loading listeners.
	for (let event in listeners) {
		socket.on(event, listeners[event].bind(null, socket));
	}
};

io.on("connection", onSocketConnection);
