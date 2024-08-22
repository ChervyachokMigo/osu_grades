const { auth } = require("osu-api-extended");
const { found_X_scores_beatmap } = require("../../../misc/text_templates");
const config_control = require("../../../modules/config_control");
const { request_beatmap_user_scores_v2 } = require("../../../modules/osu_requests_v2");
const { gamemode } = require("../../../misc/const");


module.exports = async ( chunk_item, procedure_data ) => {

	const userid = procedure_data.userid;
	const token = procedure_data.v2_token;

	const beatmap = chunk_item.data_in;

	try {
		config_control.init();
		auth.set_v2(token);

		const res_data = await request_beatmap_user_scores_v2({ 
			beatmap_id: beatmap.beatmap_id, 
			gamemode: gamemode[beatmap.gamemode],
			userid,
		});
		
		if (res_data) {
			const scores = res_data.map( x => ({ ...x, beatmap_md5: beatmap.md5 }));
			if (scores.length) { 
				console.log( found_X_scores_beatmap({ length: scores.length, userid, beatmap }) );
			}
			return { status: 'success', data_out: scores, proxy: false };
		}

		return { status: 'no data', data_out: null, proxy: false };
	} catch (e) {
		const error = e.toString();
		return { status: 'error', error, data_in: beatmap, data_out: null, proxy: false };
	}
}