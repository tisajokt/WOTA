
module.exports = function joinListenerModule(env) {
	
	// This listener has exports to env.
	const envExport = env.joinListenerModule = {};
	
	function join(socket, room) {
		
		// Socket should only be in one room at a time.
		if (socket.room) {
			socket.leave(socket.room);
		}
		
		socket.room = room;
		socket.join(room);
	};
	
	// This function is exported to env, for use in the main app.
	envExport.join = join;
	
	return function joinListener(socket, gameId) {
		join(gameId);
	};
}
