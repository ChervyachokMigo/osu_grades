
const config = require('../modules/config_control');

module.exports = {
	args: [],
	// eslint-disable-next-line no-unused-vars
	action: async( args ) => {
		await config.edit();
	}};
