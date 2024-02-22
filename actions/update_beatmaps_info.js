const { existsSync, readFileSync, writeFileSync } = require('fs');

const { save_beatmapsets_v1 } = require('../modules/DB/beatmap');
const { request_beatmaps_by_date } = require('../modules/osu_requests_v1');

const { saved_since_date_path } = require('../misc/const');
const { check_gamemode, boolean_from_string } = require('../tools/misc');
const path = require('path');

const since_date_start = '2007-01-01';
const limit = 500;

module.exports = {
	args: ['gamemode', 'from_begin'],
	action: async( args ) => {
		console.log( 'update beatmaps info, v1 api');

		let is_continue = true;

		//check gamemode
		const ruleset = check_gamemode( args.gamemode );

		const saved_since_date_gamemode_path = path.join( saved_since_date_path, `${ruleset.idx}.json` );

		let since_date = !boolean_from_string( args.from_begin || null ) && existsSync( saved_since_date_gamemode_path ) ? 
			JSON.parse( readFileSync( saved_since_date_gamemode_path, 'utf8' )).since_date : 
			since_date_start;

		while ( is_continue ) {
			console.log( 'get beatmaps since', since_date );
			try {
				const beatmaps = await request_beatmaps_by_date({ since_date, limit, gamemode: ruleset.idx });

				if (!beatmaps || beatmaps.length == 0) break;
                
				const res = await save_beatmapsets_v1( beatmaps );
				if (!res.is_valid) break;

				since_date = res.since_date;

				if ( !res.is_valid ) {
					console.error('Не удалось сохранить все данные одной из карт.');
				}
                
			} catch (e) {
				console.error(e);
				break;
			}
		}

		console.log('done updating data');
		writeFileSync( saved_since_date_gamemode_path, JSON.stringify({ since_date }), 'utf8' );
        
	}
};
