
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
const usersById = {};
const usersByKey = {};

var nextSocketId2 = 0;

// This env object is passed to other scripts
const env = {
	io: io,
	config: config,
	sockets: sockets,
	usersById: usersById,
	usersByKey: usersByKey
};

// All files in /server/listeners are loaded as modules into the listeners object.
// These modules are functions that take env as a parameter, and return a listener function.
fs.readdirSync("./listeners/").forEach((event) => {
	listeners[event.split(".")[0]] = require("./listeners/" + event)(env);
});

// All requests serve within the /client directory, ex. www.website.com/js/script1.js would serve /client/js/script1.js.
// path.join is used to properly resolve ".."
app.use("/", express.static(path.join(__dirname, "../client")));

server.listen(config.port, () => {
	console.log(`Started WOTA server, listening on port ${config.port}.`);
});

function onSocketConnection(socket) {
	sockets[socket.id] = socket;
	socket.id2 = nextSocketId2++;
	Object.defineProperty(socket, "fullId", {
		get: function getFullId() {
			return this.id.substring(0, 4) + ":s" + this.id2 + ":u" + (this.user ? this.user.id : "?");
		}
	});
	
	console.log(`Socket ${socket.fullId} connected.`);
	
	// When a socket connects, it's set to listen to all events as defined in /server/listeners.
	// Their first argument (socket) is bound to the socket variable.
	for (let event in listeners) {
		socket.on(event, listeners[event].bind(null, socket));
	}
	
	// Request that the client send over its userKey, if it has one saved
	socket.emit("userKey", "req");
	env.joinListenerModule.join(socket, "none");
};

// onSocketConnection(socket) called whenever a new socket connects
io.on("connection", onSocketConnection);
