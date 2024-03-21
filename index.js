const input = require('input');
const { existsSync } = require('fs');


const { folder_prepare } = require('./tools/misc');
const { prepareDB } = require('./modules/DB/defines');
const { init_cache } = require('./modules/cache');

const config = require('./modules/config_control.js');
folder_prepare('data');
config.init();

const laucher_presets = require('./misc/laucher-presets');
const command_start = require('./command_start');
const webconfig = require('./modules/webserver/config');

webconfig.init();

const process_args = process.argv.slice(2);

const select_action = async ( selected_action ) => {
	if (selected_action.category){
		const selected_item = await input.select( laucher_presets.get_category( selected_action.category ));

		if (selected_item?.category){
			await select_action( selected_item );
		} else if (selected_item?.action){
			if (selected_item.action === 'exit') {
				console.log( 'launcher is close');
				process.exit(0);
			} else if (selected_item.action === 'back') {
				await select_action({ category: selected_item.back_category });
			} else {
				await command_start( [selected_item.action, ...selected_item.args ] );
				await select_action({ category: selected_action.category });
			}
		}
	}
};

var checkUpdate = require('check-update-github');
var pkg = require('./package.json');
const { request_beatmap_by_id } = require('./modules/osu_requests_v1');
const osu_auth = require('./tools/osu_auth');
const path = require('path');

const v1_check_config = async () => {
	if (!config.get_value('api_key')){
		return false;
	}
	return await request_beatmap_by_id({ beatmap: 75 });
};

const v2_check_config = async () => {
	if (!config.get_value('api_v2_app_id') || !config.get_value('api_v2_app_key')){
		return false;
	}
	return await osu_auth();
};

const osu_path_check = () => {
	const osu_path = config.get_value('osu_path');
	return existsSync(path.join(osu_path, 'scores.db')) && existsSync(path.join(osu_path, 'collection.db'));
};

const prepare_config = async() => {
	const db = await prepareDB();
	const v1 = await v1_check_config();
	const v2 = await v2_check_config();
	const osu = osu_path_check();

	if (!db) console.error('DB Init error');
	if (!v1) console.error('API v1 key error');
	if (!v2) console.error('API v2 key error');
	if (!osu) console.error('Osu path incorrect');

	if (!db || !v1 || !v2 || !osu) {
		await config.edit();
		return false;
	} else {
		return true;
	}
};

const launcher_start = async() => {
	let res = false;
	do {
		res = await prepare_config();
	} while (res == false);

	await new Promise( res => checkUpdate({
		name: pkg.name, 
		currentVersion: pkg.version, 
		user: 'ChervyachokMigo',
		branch: 'master'
	}, function(err, latestVersion, defaultMessage){
		if(!err){
			console.log(defaultMessage);
			res( true );
		}
	}));

	init_cache();	

	if (process_args.length > 0) {
		await command_start( process_args );
		process.exit(0);
	} else {
		// eslint-disable-next-line no-constant-condition
		while(true) {
			if ( await select_action({ category: 'main' })) {
				break;
			}
		}
	}

};

launcher_start();