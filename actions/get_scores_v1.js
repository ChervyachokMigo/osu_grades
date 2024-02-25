const get_scores_loop = require('../tools/loops/get_scores_loop');
const { save_scores_v1 } = require('../modules/scores/v1');
const { request_beatmap_user_scores } = require('../modules/osu_requests_v1');
const { found_X_scores_beatmap } = require('../misc/text_templates');

module.exports = {
	args: ['userid', 'gamemode', 'continue_md5'],
	action: async( args ) => {
		console.log('getting scores with v1');

		await get_scores_loop({ args, score_mode: 1,
			callback: async ( beatmap, userid ) => {
				try {
					const data = await request_beatmap_user_scores({ beatmap, userid });

					if (data) {
						const res = await save_scores_v1( data );
						if (res) { 
							console.log( found_X_scores_beatmap({ length: res, userid, beatmap }) );
						}
						return res;
					}

					return false;
				} catch (e) {
					console.log( 'Error get scores beatmap', beatmap );
					throw new Error( e );
				}
			}});
	}};
