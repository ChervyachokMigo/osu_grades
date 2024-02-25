
const get_scores_loop = require('../tools/loops/get_scores_loop');
const { save_scores_v2 } = require('../modules/scores/v2');
const { request_beatmap_user_scores_v2 } = require('../modules/osu_requests_v2');
const { gamemode } = require('../misc/const');
const { found_X_scores_beatmap } = require('../misc/text_templates');

module.exports = {
	args: ['userid', 'gamemode', 'continue_md5'],
	action: async( args ) => {
		console.log('getting scores with v2');

		await get_scores_loop({ args, score_mode: 2,
			callback: async ( beatmap, userid ) => {
				try {
					const data = await request_beatmap_user_scores_v2({ 
						beatmap_id: beatmap.beatmap_id, 
						gamemode: gamemode[beatmap.gamemode],
						userid, 
					});
					
					if (data){
						const scores = data.map( x => ({ ...x, beatmap_md5: beatmap.md5 }));
						const res = await save_scores_v2( scores );
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