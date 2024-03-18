const { text_score_mode } = require('../misc/const');
const config = require('../modules/config_control');

module.exports = {
	args: [],
	// eslint-disable-next-line no-unused-vars
	action: async( args ) => {
		let api_version = config.get_value('api_version');
		api_version = api_version + 1;
		if (api_version > 3) api_version = 1;
		config.set_value('api_version', api_version);
		console.log('current api version:', text_score_mode[api_version]); 
	}};
