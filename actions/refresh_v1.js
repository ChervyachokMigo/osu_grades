const { save_scores_v1, update_grades_v1 } = require('../modules/scores/v1');
const refresh_users_loop = require('../tools/loops/refresh_users_loop');
const { request_user_recent_scores } = require('../modules/osu_requests_v1');
const { gamemode } = require('../misc/const');
const { found_X_scores_gamemode } = require('../misc/text_templates');
const { get_ruleset_by_gamemode_int } = require('../tools/misc');

module.exports = {
	args: ['userid', 'gamemode'],
	action: async( args ) => {
		console.log('getting recent scores v1');

		await refresh_users_loop({ args, looping: false, score_mode: 1,
			callback: async ({ userid, ruleset }) => {
				try {
					// count 1 for selected mode from ruleset
					// count gamemode.length for all gamemodes
					let count = 1;
					if ( ruleset.idx < 0 ) {
						count = gamemode.length;
					}

					let data_length = 0;
					while ( count > 0 ) {
						// ruleset iterator
						let gamemode_int = ruleset.idx >= 0 ? ruleset.idx : gamemode.length - count;
						let current_ruleset = get_ruleset_by_gamemode_int( gamemode_int );

						const data = await request_user_recent_scores({ userid, ruleset: current_ruleset });
						if ( !data ) {
							await update_grades_v1({ userid, gamemode: current_ruleset.idx });
							return false;
						}

						await save_scores_v1( data ); 
						if (data.length)
							console.log( found_X_scores_gamemode({ length: data.length, userid, gamemode_int: current_ruleset.idx }) );
						
						await update_grades_v1({ userid, gamemode: current_ruleset.idx });

						data_length += data.length;
						count--;
					}

					return data_length;

				} catch (e) {
					console.error( e );
					return false;
				}
				
			}});
	}
};