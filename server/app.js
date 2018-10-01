
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const fs = require("fs");
const port = 80;

const config = require("./config.json");
const sockets = {};
const listeners = {};

const env = {
	config: config,
	sockets: sockets
};

fs.readdirSync("./listeners/").forEach((event) => {
	listeners[event.split(".")[0]] = require("./listeners/" + event).bind(null, env);
});

app.use("/", express.static(path.join(__dirname, "../client")));

server.listen(port, () => {
	console.log(`Started WOTA server, listening on port ${port}.`);
});

function onSocketConnection(socket) {
	sockets[socket.id] = socket;
	console.log(`A user connected, ${socket.id}.`);
	for (let event in listeners) {
		socket.on(event, listeners[event].bind(null, socket));
	}
};

io.on("connection", onSocketConnection);
