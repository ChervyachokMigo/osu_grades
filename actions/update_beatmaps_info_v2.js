const { writeFileSync } = require('fs');
const path = require('path');

const osu_auth = require('../tools/osu_auth');
const { save_beatmapsets_v2 } = require('../modules/DB/beatmap');
const { check_gamemode, print_processed, folder_prepare, is_gamemode, load_json } = require('../tools/misc');
const { request_beatmaps_by_cursor_v2 } = require('../modules/osu_requests_v2');
const { beatmap_status_bancho_text, beatmaps_v2_request_limit, load_path, saved_cursor_v2_beatmaps_name } = require('../misc/const');

const cursor_default = null;

module.exports = {
	args: ['gamemode', 'status', 'cursor'],
	action: async( args ) => {
		console.log( 'update beatmaps info, v2 api');

		console.log( 'authing to osu' );
		await osu_auth();

		folder_prepare(load_path);

		//check gamemode
		const args_ruleset = check_gamemode( args.gamemode );
		const first_gamemode_idx_if_all = 0;
		let current_gamemode = is_gamemode(args_ruleset.idx) ? args_ruleset.idx : first_gamemode_idx_if_all;
		
		while ( is_gamemode( current_gamemode )) {
			console.log( 'current gamemode', current_gamemode );
			const saved_cursor_v2_beatmaps_gamemode_path = path.join( load_path, saved_cursor_v2_beatmaps_name + `_${current_gamemode}.json` );
			// check cursor string
			// arg first, then load, then null
			
			let cursor_string = cursor_default;

			if (args?.cursor === 'false'){
				const data = load_json( saved_cursor_v2_beatmaps_gamemode_path );
				cursor_string = data && data?.cursor_string ? data.cursor_string : cursor_default;

			} else if (args?.cursor === 'true'){
				cursor_string = cursor_default;

			} else {
				cursor_string = args?.cursor || cursor_default;
			}

			// check status, default 1 (ranked)
			const status = beatmap_status_bancho_text[args.status || '1'];

			// changeble in loop variables
			let is_continue = true;
			let total_beatmaps = 0;
			let count_beatmaps = 0;
			let approved_date = null;
			
			let cursor_to_save = null;

			while ( is_continue ) {
				try {
					
					const bancho_res = await request_beatmaps_by_cursor_v2({ ruleset: check_gamemode(current_gamemode), status, cursor_string });

					if ( !bancho_res ) {
						console.log( 'no response from bancho' );
						break; 
					}

					if (bancho_res === null) {
						console.log('no founded beatmaps, ended.');
						break;
					}
					
					if ( bancho_res?.cursor && bancho_res.cursor?.approved_date ) {
						approved_date = bancho_res.cursor.approved_date;
						console.log('requesting beatmaps by date', new Date(approved_date).toLocaleString() ?? 'now' );
					}

					const beatmaps = bancho_res?.beatmapsets;

					// last beatmapsets
					if ( !bancho_res?.cursor || bancho_res?.cursor?.approved_date === null ){
						is_continue = false;
					} else {
						if ( beatmaps && beatmaps.length > 0 ) {
							cursor_string = bancho_res?.cursor_string;
						}
					}

					if ( beatmaps.length >= beatmaps_v2_request_limit )
						cursor_to_save = { cursor_string };

					count_beatmaps++;

					if (!total_beatmaps){
						total_beatmaps = bancho_res?.total;
					}

					print_processed({ 
						current: count_beatmaps, 
						size: total_beatmaps / beatmaps_v2_request_limit, 
						initial: 1, 
						frequency: 50, 
						multiplier: beatmaps_v2_request_limit, 
					});
		
					const res = await save_beatmapsets_v2( beatmaps );
					
					if ( !res.is_valid ) {
						console.log(res);
						console.error('Не удалось сохранить все данные одной из карт.');
					}
					
				} catch (e) {
					console.error(e);
					break;
				}

			}

			if ( cursor_to_save ) {
				writeFileSync( saved_cursor_v2_beatmaps_gamemode_path, JSON.stringify( cursor_to_save ), 'utf8' );
			}

			const break_value = -1;
			current_gamemode = is_gamemode(args_ruleset.idx) ? break_value : current_gamemode + 1;
		}

		console.log('done updating data');
	}
};
