const { existsSync, readFileSync, writeFileSync } = require('fs');

const osu_auth = require('../tools/osu_auth');
const { save_beatmaps_info_v2 } = require('../modules/DB/beatmap');
const { check_gamemode } = require('../tools/misc');
const { request_beatmaps_by_cursor_v2 } = require('../modules/osu_requests_v2');
const { getting_beatmaps_progress } = require('../misc/text_templates');
const { saved_beatmaps_cursor_v2_path, beatmap_status_bancho_text } = require('../misc/const');

const save_cursor = (cursor_string) => writeFileSync( saved_beatmaps_cursor_v2_path, JSON.stringify({ cursor_string }), 'utf8' );

module.exports = {
	args: ['gamemode', 'status', 'cursor'],
	action: async( args ) => {
		console.log( 'update beatmaps info, v2 api');
		console.log( 'args', args );
		console.log( 'authing to osu' );
		await osu_auth();

		//check gamemode
		const ruleset = check_gamemode( args.gamemode );

		let cursor_string = args.cursor || existsSync( saved_beatmaps_cursor_v2_path ) ? 
			JSON.parse( readFileSync( saved_beatmaps_cursor_v2_path, 'utf8' )).cursor_string : 
			null;
		let old_cursor = cursor_string;

		const status = beatmap_status_bancho_text[args.status] || '1';

		let is_continue = true;
		let total_beatmaps = 0;
		let count_beatmaps = 0;

		while ( is_continue ) {
			try {
				console.log('requesting beatmaps by cursor', cursor_string );
				const res = await request_beatmaps_by_cursor_v2({ ruleset, status, cursor_string });
				if ( !res ) {
					console.log('no response from bancho');
					break; 
				}
				if ( res?.total == 0 || cursor_string === null || cursor_string === undefined) {
					console.log('cursor null, founded maps 0, ended.');
					break;
				}

				const beatmaps = res.beatmaps?.beatmapsets;
				count_beatmaps += beatmaps.length;
				if ( !total_beatmaps ) {
					total_beatmaps = res?.total;
				}

				console.log( getting_beatmaps_progress(
					{ beatmaps_length: beatmaps.length, count_beatmaps, total_beatmaps }));

				if ( old_cursor !== cursor_string ){
					save_cursor( old_cursor );
				}

				old_cursor = cursor_string;

				if ( beatmaps && beatmaps.length > 0 ) {
					cursor_string = res.cursor_string;
				} else {
					cursor_string = null;
					console.log('founded maps 0, ended.');
					break;
				}

				await save_beatmaps_info_v2( beatmaps );				

				if (cursor_string === old_cursor && cursor_string !== null) {
					console.log('last cursor. ended.');
					break;
				}
				
			} catch (e) {
				console.error(e);
				break;
			}

			console.log('done updating data');
		}

		
	}
};
