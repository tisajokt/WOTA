
module.exports = function chatListenerModule(env) {
	
	const htmlEncodes = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#x27;",
		"/": "&#x2F;",
		"\\": "&#92;"
	};
	function sanitize(message, replacements) {
		var out = "";
		for (let i = 0; i < message.length; i++) {
			let thisReplacement = replacements[message[i]];
			if (thisReplacement !== undefined) {
				out += thisReplacement || "";
			} else {
				out += message[i];
			}
		}
		return out;
	};
	
	return function chatListener(socket, message, target) {
		message = sanitize(message, htmlEncodes);
		if (target) {
			env.io.to(target).emit("chat", socket.chatName, socket.chatColor, message);
		} else {
			env.io.to(socket.room).emit("chat", socket.chatName, socket.chatColor, message);
		}
	};
}
