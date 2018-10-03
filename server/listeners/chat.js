
module.exports = function chatListenerModule(env) {
	
	return function chatListener(socket, message, target) {
		if (target) {
			env.io.to(target).emit("chat", socket.chatName, socket.chatColor, message);
		} else {
			env.io.to(socket.room).emit("chat", socket.chatName, socket.chatColor, message);
		}
	};
}
