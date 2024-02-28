const input = require('input');
const webserver = require('../modules/webserver/actions');
const { Num } = require('../tools/misc');
const web_config = require('../modules/webserver/config');
const config = require('../modules/webserver/config');

let is_loaded = false;

module.exports = {
	get_is_loaded: () => is_loaded,
	args: ['start_action'],
	action: async( args ) => {
		let start_action = Num(args.start_action, null);
		const selected = start_action;
		const selected_userid = config.get_value( 'web_selected_userid');
			
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
};
