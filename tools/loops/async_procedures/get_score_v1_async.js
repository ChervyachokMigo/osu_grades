const { found_X_scores_beatmap } = require("../../../misc/text_templates");
const config_control = require("../../../modules/config_control");
const { request_beatmap_user_scores } = require("../../../modules/osu_requests_v1");
const { save_scores_v1 } = require("../../../modules/scores/v1");


module.exports = async ( chunk_item, procedure_data ) => {

	const userid = procedure_data.userid;

	const data_in = chunk_item.data_in;
	const proxy = chunk_item.proxy;

	try {
		config_control.init();

		const res_data = await request_beatmap_user_scores({ 
			beatmap: data_in, 
			userid, 
			proxy: proxy ? {
				host: proxy.host,
				port: proxy.port,
				protocol: proxy.protocol
			} : false
		});

		if (res_data) {
			if (res_data.length) { 
				console.log( found_X_scores_beatmap({ length: res_data.length, userid, beatmap: data_in }) );
			}
			return { status: 'success', data_out: res_data, proxy: proxy || false };
		}

		return { status: 'no data', data_out: null, proxy: proxy || false };
	} catch (e) {
		const error = e.toString();
		return { status: 'error', error, data_in, data_out: null, proxy: proxy || false };
	}
}