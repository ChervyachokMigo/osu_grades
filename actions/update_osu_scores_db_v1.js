const input = require('input');

const { get_ruleset_by_gamemode_int, get_objects_attributes } = require('../tools/misc');
const { update_osu_scores_db } = require('../modules/scores/v1');
const { findAll } = require('../modules/DB/users');

module.exports = {
	args: [],
	// eslint-disable-next-line no-unused-vars
	action: async( args ) => {
		console.log('update_osu_scores_db_v1');

		let users = get_objects_attributes( 
			await findAll({ score_mode: 1 }), 
			['userid', 'username', 'gamemode', 'score_mode']
		);

		if ( users.length == 0) {
			console.log( 'No users' );
			return;
		
		} else if ( users.length > 1 ) {
			users = await input.checkboxes( users.map( value => ({ 
				name: `[${get_ruleset_by_gamemode_int(value.gamemode).name}] ${value.username}`, 
				value
			})));
			
		}	

		await update_osu_scores_db( users );
	}};