
// Module exports a function, which takes the main app's env object as a parameter
// It returns a socket listener function
module.exports = function userKeyListenerModule(env) {
	const uuidv4 = require('uuid/v4');
	var nextId = 0;

	function getUserKey() {
		let key;
		// While a generated key is already being used, generate a new key
		while (env.usersByKey[key = uuidv4()]);
		return key;
	};
	
	function User() {
		let key = getUserKey();
		this.key = key;
		let id = nextId++;
		this.id = id;
		this.sockets = [];
		
		env.usersById[this.id] = this;
		env.usersByKey[this.key] = this;
		
		// Automatic cleanup if a user is created but the socket never identifies with it, for whatever reason
		this.killSelf = setTimeout(() => {
			delete env.usersById[id];
			delete env.usersByKey[key];
		}, 10000);
	};

	// Identifies a socket with this user
	User.prototype.connect = function userConnect(socket) {
		if (this.killSelf != undefined) {
			clearTimeout(this.killSelf);
			delete this.killSelf;
		}
		
		if (this.sockets.indexOf(socket) > -1)
			return;
		this.sockets.push(socket);
		socket.user = this;
		
		console.log(`Socket ${socket.fullId} identified with user.`);
		
		var user = this;
		socket.on("disconnect", () => {
			user.sockets.splice(user.sockets.indexOf(socket), 1);
		});
	};

	// Emit to all sockets identified with this user
	// This will probably be useful? It is kinda the entire point of this user system in the first place.
	User.prototype.emit = function userEmit(event, data) {
		this.sockets.forEach((socket) => {
			socket.emit(event, data);
		});
	};

	return function userKeyListener(socket, data) {
		// If socket is identified with a user already, report and ignore
		// Possibly malicious
		if (socket.user) {
			console.log(`Socket ${socket.fullId} sent ${data} in 'userKey' event when already identified with a user.`);
			return;
		}
		
		// debug
		// console.log(`Socket ${socket.id} sent ${data} in 'userKey' event.`);
		
		if (data == "req" || !env.usersByKey[data]) {
			// If socket is sending over its supposed userKey but has already been explicitly assigned one from server, report and ignore
			// Possibly malicious
			if (data != "req" && ++socket.attempts > 1) {
				console.log(`Socket ${socket.fullId} sent incorrect key ${data} in 'userKey' event when already assigned a user.`);
				return;
			}
			
			// If data is a request for an assignment, or an incorrect/outdated userKey, send over a userKey assignment
			let newUser = new User();
			socket.emit("userKey", newUser.key);
			
		} else {
			// If data is a correct userKey, identify socket with corresponding user
			env.usersByKey[data].connect(socket);
			socket.emit("userKey", "ok");
		}
	};
};
