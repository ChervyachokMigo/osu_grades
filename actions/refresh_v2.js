const { save_scores_v2, update_grades_v2 } = require('../modules/scores/v2');
const refresh_users_loop = require('../tools/loops/refresh_users_loop');
const { request_user_recent_scores_v2 } = require('../modules/osu_requests_v2');
const { found_X_scores_gamemode } = require('../misc/text_templates');

module.exports = {
	args: ['userid', 'gamemode'],
	action: async( args ) => {
		console.log('getting recent scores v2');

		await refresh_users_loop({ args, looping: true, score_mode: 2,
			callback: async ({ userid, ruleset, offset, limit }) => {
				try {
					const data = await request_user_recent_scores_v2({ userid, ruleset, offset, limit });
					if ( !data ) {
						await update_grades_v2( { userid, gamemode: ruleset.idx } );
						return false;
					}

					await save_scores_v2( data );

					if (data.length)
						console.log( found_X_scores_gamemode({ length: data.length, userid, gamemode_int: ruleset.idx }) );

					await update_grades_v2( { userid, gamemode: ruleset.idx } );

					return data.length;
				} catch (e) {
					console.error( e );
					return false;
				}
			}});
	}};
