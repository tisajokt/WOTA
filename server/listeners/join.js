
module.exports = function joinListenerModule(env) {
	
	// This listener has exports to env.
	const envExport = env.joinListenerModule = {};
	const anonymizerAnimals = "Aardvark,Penguin,Elephant,Beaver,Bison,Bear,Moose,Leopard,Wolf,Dolphin,Badger,Whale,Owl,Goose,Bat,Rhino,Ferret,Orangutan,Zebra,Bobcat,Caribou,Cat,Seal,Crocodile,Alligator,Antelope,Robin,Lynx,Goldfish,Frog,Toad,Tortoise,Turtle,Iguana,Slug,Snail,Anteater,Panda,Giraffe,Gorilla,Shark,Flamingo,Rabbit,Heron,Hippo,Hummingbird,Hyena,Woodpecker,Jellyfish,Koala,Lizard,Lemur,Monkey,Ape,Snake,Manatee,Meerkat,Butterfly,Lion,Tiger,Cheetah,Newt,Salamander,Armadillo,Cardinal,Bluejay,Ocelot,Orca,Ostrich,Pigeon,Raven,Pig,Fox,Reindeer,Sponge,Tapir,Titmouse,Chicken,Cow,Horse,Human,Neandertal,Jackalope,Dragon,Elf,Dwarf".split(",");
	const anonymizerAdjectives = "Ancient,Adorable,Adventurous,Adaptable,Ambitious,Awesome,Brave,Belligerent,Bizarre,Charming,Classy,Clever,Cultured,Curious,Dangerous,Delightful,Defiant,Determined,Eager,Educated,Efficient,Enchanting,Eager,Enthusiastic,Elegant,Fortunate,Fierce,Guiltless,Gifted,Glamorous,Gentle,Handsome,Helpful,Industrious,Important,Incredible,Infamous,Spanish Inquisitive,Intelligent,Kind,Lethal,Magnificent,Melodic,Mysterious,Nimble,Naughty,Proud,Powerful,Quaint,Rebellious,Resolute,Righteous,Secretive,Serious,Silent,Sincere,Successful,Superb,Swift,Steadfast,Thoughtful,Victorious".split(",");
	
	var nextHue = Math.random();
	
	// Golden ratio minus 1
	// This should, in theory, keep the chat hues as far apart as possible... since the golden ratio is the most irrational number... that's how this works, right?
	// Added to nextHue each time a color is generated
	const hueIncrement = 0.6180339887;
	
	// Source: https://gist.github.com/mjackson/5311256
	function hslToRgb(h, s, l) {
		var r, g, b;
				
		if (s == 0) {
			r = g = b = l; // achromatic
		} else {
			function hue2rgb(p, q, t) {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1/6) return p + (q - p) * 6 * t;
				if (t < 1/2) return q;
				if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}
		return [ r * 255, g * 255, b * 255 ];
	};
	
	function colorValueProcess(color) {
		color = Math.round(color).toString(16);
		return color.length == 1 ? "0" + color : color;
	};
	
	function randomAnonymizer() {
		return anonymizerAdjectives[Math.floor(Math.random() * anonymizerAdjectives.length)] +
			" " + anonymizerAnimals[Math.floor(Math.random() * anonymizerAnimals.length)];
	};
	function randomColorCode() {
		var rgb = hslToRgb(nextHue, 0.9, 0.4);
		nextHue = (nextHue + hueIncrement) % 1;
		return "#" + colorValueProcess(rgb[0]) + colorValueProcess(rgb[1]) + colorValueProcess(rgb[2]);
	};
	
	function join(socket, room) {
		
		// Socket should only be in one room at a time.
		if (socket.room) {
			socket.leave(socket.room);
		}
		
		socket.room = room;
		socket.join(room);
		
		if (!socket.user || !socket.user.account || socket.user.account.anonymous) {
			socket.chatName = randomAnonymizer();
		} else {
			socket.chatName = socket.user.account.name;
		}
		socket.chatColor = randomColorCode();
		
		env.sendMessage("Server", `You have joined chat as <span style="color:${socket.chatColor};">${socket.chatName}</span>.`, socket.id, "#555", false);
	};
	
	// This function is exported to env, for use in the main app.
	envExport.join = join;
	
	return function joinListener(socket, gameId) {
		join(gameId);
	};
}
