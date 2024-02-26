const input = require('input');
const webserver = require('../modules/webserver/actions');
const { Num } = require('../tools/misc');
const web_config = require('../modules/webserver/config');
const config = require('../modules/webserver/config');

let is_loaded = false;

module.exports = {
	args: ['start_action'],
	action: async( args ) => {
		let start_action = Num(args.start_action, null);

		await web_config.init();

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const selected_userid = config.get_value( 'web_selected_userid');
			console.clear();

			let webserser_variants = !is_loaded ? 
				[{ name: 'Start webserver', value: 1, disabled: selected_userid == 0 }] : 
				[{ name: 'Open webpage', value: 3 }, { name: 'Stop webserver', value: 0 }, { name: 'Restart webserver', value: 2}];

			const selected = start_action || await input.select('Webserver menu', [
				...webserser_variants,
				{ name: 'Edit config', value: 4 },
				{ name: 'Reset config', value: 5 },
				{ name: 'Exit', value: -1 } 
			]);
			
			try {
				if (selected === -1) {
					return;
				} else if (selected === 1 && selected_userid > 0 ) {
					await webserver.init();
					is_loaded = true;
				} else if (selected === 0 && selected_userid > 0 ) {
					await webserver.stop();
					is_loaded = false;
				} else if (selected === 2 && selected_userid > 0 ) {
					is_loaded = false;
					await webserver.stop();
					await webserver.init();
					is_loaded = true;
				} else if (selected === 3 && selected_userid > 0 ) {
					await webserver.open_webpage();
				} else if (selected === 4) {
					is_loaded = false;
					await webserver.stop();
					await web_config.edit();
				} else if (selected === 5) {
					is_loaded = false;
					await webserver.stop();
					if (await input.confirm('Are you sure you want to reset config?')){
						web_config.reset();
					}
				}
				start_action = null;
			} catch (e) {
				console.error(e);
			}
		}
	}
};
