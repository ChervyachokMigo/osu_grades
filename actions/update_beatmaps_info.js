const { writeFileSync } = require('fs');

const { save_beatmapsets_v1 } = require('../modules/DB/beatmap');
const { request_beatmaps_by_date } = require('../modules/osu_requests_v1');

const { beatmaps_v1_request_limit, saved_since_date_name, load_path } = require('../misc/const');
const { check_gamemode, boolean_from_string, folder_prepare, is_gamemode, load_json } = require('../tools/misc');
const path = require('path');

const since_date_start = '2007-01-01';
const limit = 500;

module.exports = {
	args: ['gamemode', 'from_begin'],
	action: async( args ) => {
		console.log( 'update beatmaps info, v1 api');

		folder_prepare(load_path);

		//check gamemode
		const args_ruleset = check_gamemode( args.gamemode );
		const first_gamemode_idx_if_all = 0;
		let current_gamemode = is_gamemode(args_ruleset.idx) ? args_ruleset.idx : first_gamemode_idx_if_all;
		
		while ( is_gamemode ( current_gamemode )) {
			console.log( 'current gamemode', current_gamemode );
			const saved_since_date_gamemode_path = path.join( load_path, saved_since_date_name + `_${current_gamemode}.json` );

			const since_date_loaded_data = load_json( saved_since_date_gamemode_path, { since_date: since_date_start });
			let since_date = !boolean_from_string( args.from_begin || null ) ? since_date_loaded_data.since_date : since_date_start ;

			let since_data_to_save = null;
			let is_continue = true;

			while ( is_continue ) {
				console.log( 'get beatmaps since', since_date );
				try {
					const params = { since_date, limit, gamemode: current_gamemode };
					const beatmaps = await request_beatmaps_by_date(params);
					
					if (!beatmaps || beatmaps === null || beatmaps.length == 0) break;

					if (beatmaps.length < beatmaps_v1_request_limit ) is_continue = false;

					const res = await save_beatmapsets_v1( beatmaps );

					since_date = res.since_date;

					if ( !res.is_valid ) {
						console.log(res);
						console.error('Не удалось сохранить все данные одной из карт.');
					}

					if ( beatmaps.length >= beatmaps_v1_request_limit )
						since_data_to_save = { since_date };
					
				} catch (e) {
					console.error(e);
					break;
				}
			}

			if ( since_data_to_save ) {
				writeFileSync( saved_since_date_gamemode_path, JSON.stringify( since_data_to_save ), 'utf8' );
			}

			const break_value = -1;
			current_gamemode = is_gamemode(args_ruleset.idx) ? break_value : current_gamemode + 1;
		}

		console.log('done updating data');
        
	}
};
