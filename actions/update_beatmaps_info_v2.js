const osu_auth = require('../tools/osu_auth');
const { save_beatmapsets_v2 } = require('../modules/DB/beatmap');
const { check_gamemode, print_processed } = require('../tools/misc');
const { request_beatmaps_by_cursor_v2 } = require('../modules/osu_requests_v2');
const { beatmap_status_bancho_text } = require('../misc/const');

module.exports = {
	args: ['gamemode', 'status', 'cursor'],
	action: async( args ) => {
		console.log( 'update beatmaps info, v2 api');
		console.log( 'args', args );
		console.log( 'authing to osu' );

		await osu_auth();

		//check gamemode
		const ruleset = check_gamemode( args.gamemode );

		//check cursor string
		let cursor_string = args.cursor || null;
		if (cursor_string?.length !== 60){
			cursor_string = null;
		}

		// check status, default 1 (ranked)
		const status = beatmap_status_bancho_text[args.status] || '1';

		// changeble in loop variables
		let is_continue = true;
		let total_beatmaps = 0;
		let count_beatmaps = 0;
		let approved_date = null;

		while ( is_continue ) {
			try {
				

				const bancho_res = await request_beatmaps_by_cursor_v2({ ruleset, status, cursor_string });
				if ( !bancho_res ) {
					console.log('no response from bancho');
					break; 
				}

				if ( approved_date === null && bancho_res.cursor && bancho_res.cursor.approved_date ) {
					approved_date = bancho_res.cursor.approved_date;
					console.log('requesting beatmaps by date', approved_date ?? 'now' );
				}

				if ( !bancho_res.cursor || bancho_res.cursor.approved_date === null ){
					approved_date = null;
					is_continue = false;
				}

				const beatmaps = bancho_res?.beatmapsets;
				
				count_beatmaps += beatmaps.length;

				if (!total_beatmaps){
					total_beatmaps = bancho_res?.total;
				}
				
				print_processed({ current: count_beatmaps, size: count_beatmaps, initial: beatmaps.length, frequency: 50 });
				//console.log( getting_beatmaps_progress({ ruleset, approved_date, beatmaps_length: beatmaps.length, count_beatmaps, total_beatmaps }));

				if ( beatmaps && beatmaps.length > 0 ) {
					cursor_string = bancho_res.cursor_string;
				} else {
					cursor_string = null;
					console.log('founded maps 0, ended.');
					break;
				}
	
				const res = await save_beatmapsets_v2( beatmaps );
				
				if ( !res.is_valid ) {
					console.error('Не удалось сохранить все данные одной из карт.');
				}
				
			} catch (e) {
				console.error(e);
				break;
			}

		}

		console.log('done updating data');
	}
};
