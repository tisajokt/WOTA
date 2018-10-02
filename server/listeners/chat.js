
module.exports = function chatListenerModule(env) {
	
	return function chatListener(socket, message, target) {
		if (target) {
			io.to(target).emit("chat", socket.id, message);
		} else {
			socket.broadcast.to(socket.room).emit("chat", socket.id, message);
		}
	};
}
