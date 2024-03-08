const input = require('input');

const { folder_prepare } = require('./tools/misc');
const { prepareDB } = require('./modules/DB/defines');
const { init_cache } = require('./modules/cache');

const laucher_presets = require('./misc/laucher-presets');
const command_start = require('./command_start');
const webconfig = require('./modules/webserver/config');

const process_args = process.argv.slice(2);

const select_action = async ( selected_action ) => {
	if (selected_action.category){
		const selected_item = await input.select( laucher_presets.get_category(selected_action.category) );

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

const launcher_start = async() => {
	folder_prepare('data');

	init_cache();
	
	await prepareDB();

	await webconfig.init();

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