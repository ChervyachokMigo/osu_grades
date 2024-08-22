const get_scores_loop = require('../tools/loops/get_scores_loop');
const { save_scores_v1 } = require('../modules/scores/v1');
const { request_beatmap_user_scores } = require('../modules/osu_requests_v1');
const { found_X_scores_beatmap } = require('../misc/text_templates');
const get_scores_loop_async = require('../tools/loops/get_scores_loop_async');

module.exports = {
	args: ['userid', 'gamemode', 'continue_md5'],
	action: async( args ) => {
		console.log('getting scores with v2 async');
		console.time('getting_scores_v2');
		await get_scores_loop_async({ args, score_mode: 2 });
		console.timeEnd('getting_scores_v2');
	}};
