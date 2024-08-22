const { readFileSync, existsSync, writeFileSync } = require('fs');
const { auth } = require ('osu-api-extended');

const { osu_token_path } = require('../misc/const');

const config = require('../modules/config_control.js');

let access_token = null;
let expires_in = null;

const login_osu_loop = async () => {
	const api_v2_app_id = config.get_value('api_v2_app_id');
	const api_v2_app_key = config.get_value('api_v2_app_key');

	access_token = await auth.login(api_v2_app_id, api_v2_app_key, ['identify','public']);

	if (typeof access_token?.access_token == 'undefined'){
		console.log('no auth osu, trying again');
		await login_osu_loop();
	} else {
		expires_in = new Date().getTime() + access_token.expires_in * 1000;
		try {
			writeFileSync(osu_token_path, JSON.stringify({access_token, time: expires_in}), { encoding: 'utf8'});
		} catch (e) {
			console.error(e);
		}
	}
};

module.exports = {
	get_token: () => access_token?.access_token || null,
	osu_auth: async () => {
		const current_time = new Date().getTime();

		if (!access_token || !expires_in){
			if (existsSync(osu_token_path)){
				const data = JSON.parse(readFileSync(osu_token_path, {encoding: 'utf8'}));
				expires_in = data.time;
				access_token = data.access_token;
				if (access_token && expires_in && current_time < expires_in) {
					auth.set_v2(access_token.access_token);
					return true;
				} else {
					await login_osu_loop();
				}
			} else {
				await login_osu_loop();
			}
		} else {
			if (access_token && expires_in && current_time > expires_in) {
				await login_osu_loop();
			} else {
				//actual token, nothing to do
				return true;
			}
		}

		return false;
	}
};
