const input = require('input');

const { check_userid } = require('../tools/misc');
const { update_osu_scores_db } = require('../modules/scores/v1');
const { findAll } = require('../modules/DB/users');

module.exports = {
	args: ['userid'],
	action: async( args ) => {
		console.log('update_osu_scores_db_v1');

		let userid = null;

		const users = (await findAll({ score_mode: 1 }))
			.filter(( v, i, a ) => a.findIndex( x => x.userid === v.userid ) === i );

		if ( users.length == 0) {
			console.log( 'No users' );
			return;
		}

		if (args.userid){
			userid = check_userid( args.userid );
			if ( !userid || users.findIndex( x => x.userid === userid ) === -1 ) {
				console.log( 'Invalid userid', args.userid );
				return;
			}
		} else {
			if ( users.length > 1 ) {
				userid = await input.select( users.map( x => ({ name: x.username, value: x.userid })));
			} else if ( users.length == 1 ) {
				userid = users[0].userid;
			}
		}		

		await update_osu_scores_db({ userid });
	}};