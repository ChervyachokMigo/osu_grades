const { writeFileSync, existsSync, readFileSync } = require('fs');
const path = require('path');

const osu_auth = require('../tools/osu_auth');
const { save_beatmapsets_v2 } = require('../modules/DB/beatmap');
const { check_gamemode, print_processed } = require('../tools/misc');
const { request_beatmaps_by_cursor_v2 } = require('../modules/osu_requests_v2');
const { beatmap_status_bancho_text, beatmaps_v2_request_limit, saved_cursor_v2_beatmaps_path } = require('../misc/const');

module.exports = {
	args: ['gamemode', 'status', 'cursor'],
	action: async( args ) => {
		console.log( 'update beatmaps info, v2 api');
		console.log( 'args', args );

		console.log( 'authing to osu' );
		await osu_auth();

		//check gamemode
		const ruleset = check_gamemode( args.gamemode );

		const saved_cursor_v2_beatmaps_gamemode_path = path.join( saved_cursor_v2_beatmaps_path + `_${ruleset.idx}.json` );
		
		// check cursor string
		// arg first, then load, then null

		let cursor_string = null;

		if (args?.cursor === 'false'){
			cursor_string = existsSync( saved_cursor_v2_beatmaps_gamemode_path )
				? JSON.parse( readFileSync( saved_cursor_v2_beatmaps_gamemode_path, 'utf8' )).cursor_string 
				: null;
		} else if (args?.cursor === 'true'){
			cursor_string = null;
		} else {
			cursor_string = args?.cursor || null;
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
				
				const bancho_res = await request_beatmaps_by_cursor_v2({ ruleset, status, cursor_string });

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

		console.log('done updating data');
	}
};
