
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");
const port = 80;

var sockets = {};

app.use("/", express.static(path.join(__dirname, "../client")));

server.listen(port, () => {
	console.log(`Started WOTA server, listening on port ${port}.`);
});

io.on("connection", (socket) => {
	sockets[socket.id] = socket;
	console.log(`A user connected, ${socket.id}.`);
});
