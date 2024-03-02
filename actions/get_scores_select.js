const users = require('../modules/DB/users');
const get_scores_v1 = require('./get_scores_v1');
const get_scores_v2 = require('./get_scores_v2');
const get_scores_v2_json = require('./get_scores_v2_json');
const actions = {
	1: get_scores_v1.action,
	2: get_scores_v2.action,
	3: get_scores_v2_json.action
};
			
module.exports = {
	args: [ 'continue_md5' ],

	action: async( args ) => {
		await users.users_variants( 'checkboxes', async ( selected ) => {

			console.log('selected', selected );

			await actions[selected.score_mode]({ 
				userid: selected.userid, 
				gamemode: selected.gamemode, 
				continue_md5: args.continue_md5 
			});
		});

	}};
