const { readdirSync } = require('fs');

const { folder_prepare } = require('../tools/misc');
const count_grades_v2_json = require('./count_grades_v2_json');
const get_list_v2_json = require('./get_list_v2_json');

const { scores_folder_path } = require('../misc/const');

module.exports = {
	args: [],
	// eslint-disable-next-line no-unused-vars
	action: async( args ) => {
		//check scores folder
		folder_prepare(scores_folder_path);

		const users = readdirSync(scores_folder_path, {encoding: 'utf8'} );

		if (users.length == 0) {
			console.log('no users for recounting');
			return;
		}

		for (let userid of users){
			count_grades_v2_json.action({ userid });
			get_list_v2_json.action({ userid });
		}
	}};