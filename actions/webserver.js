const input = require('input');
const webserver = require('../modules/webserver/actions');

let is_loaded = false;

module.exports = {
	args: [],
	action: async( args ) => {
		while (true) {
			console.clear();

			let webserser_variants = !is_loaded ? 
				[{ name: 'Start webserver', value: 1 }] : 
				[{ name: 'Open webpage', value: 3 }, { name: 'Stop webserver', value: 0 }, { name: 'Restart webserver', value: 2}];

			const selected = await input.select('Webserver menu', [
				...webserser_variants,
				{ name: 'Exit', value: -1 } 
			]);
			
			try {
				if (selected === -1) {
					return;
				} else if (selected === 1) {
					await webserver.init();
					is_loaded = true;
				} else if (selected === 0) {
					await webserver.stop();
					is_loaded = false;
				} else if (selected === 2) {
					await webserver.restart();
					is_loaded = true;
				} else if (selected === 3) {
					await webserver.open_webpage();
				}

			} catch (e) {
				console.error(e);
			}
		}
	}
};
