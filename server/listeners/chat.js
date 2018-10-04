
module.exports = function chatListenerModule(env) {
	
	// This listener has exports to env.
	const envExport = env.chatListenerModule = {};
	
	// HTML encodes recommended for proper sanitization when inserting into HTML element content
	// https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
	const htmlEncodes = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;",
		"'": "&#x27;",
		"/": "&#x2F;",
		"\\": "&#92;"
	};
	function charReplace(message, replacements) {
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
	
	function sendMessage(name, message, target, color, sanitize=true) {
		if (sanitize) {
			message = charReplace(message, htmlEncodes);
		}
		env.io.to(target).emit("chat", name, color, message);
	};
	
	function checkSpam(socket, message, target) {
		if (!socket.lastChats) {
			socket.lastChats = [ Date.now() ];
		} else if (socket.lastChats.length < env.config.chatSpamMessagesAllowedPerInterval) {
			socket.lastChats.push(Date.now());
		} else {
			var earlyChat = socket.lastChats.splice(0, 1)[0];
			var now = Date.now();
			socket.lastChats.push(now);
			if (now - earlyChat < 1000 * env.config.chatSpamIntervalSeconds) {
				socket.chatSpamTimeout = now + 1000 * env.config.chatSpamTimeout;
				return true;
			}
		}
	};
	
	// This function is exported to env, for use elsewhere.
	envExport.sendMessage = sendMessage;
	
	return function chatListener(socket, message, target) {
		var now = Date.now();
		
		if (message == "")
			return;
		
		if (socket.chatSpamTimeout && socket.chatSpamTimeout - now > 0) {
			sendMessage("Server", `Wait ${Math.ceil((socket.chatSpamTimeout - now) / 1000)} seconds to post again.`, socket.id, "#555", false);
		} else if (checkSpam(socket, message, target)) {
			sendMessage("Server", `You are sending messages too fast.`, socket.id, "#555", false);
		} else {
			sendMessage(socket.chatName, message, target || socket.room, socket.chatColor, true);
		}
	};
}
