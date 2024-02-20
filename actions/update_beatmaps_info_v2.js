const { existsSync, readFileSync, writeFileSync } = require("fs");

const save_beatmap_info = require("../modules/beatmaps/save_beatmap_info");
const { request_beatmaps_by_date } = require("../modules/osu_requests_v1");

const { saved_since_date_path } = require("../misc/const");
const { check_gamemode } = require("../tools/misc");
const since_date_start = '2007-01-01';
/*const limit = 500;

module.exports = {
    args: ['gamemode'],
    action: async( args ) => {
        let is_continue = true;

        let since_date = existsSync( saved_since_date_path ) ? 
            JSON.parse( readFileSync( saved_since_date_path, 'utf8' )).since_date : 
            since_date_start;

        //check gamemode
        const ruleset = check_gamemode( args.gamemode );

        while ( is_continue ) {
            console.log( 'get beatmaps since', since_date );
           // try {
                const beatmaps = await request_beatmaps_by_date({ since_date, limit, gamemode: ruleset.idx });

                if (!beatmaps) break;
                
                for ( let beatmap_v1 of beatmaps ) {
                    since_date = beatmap_v1.approved_date;
                    await save_beatmap_info( beatmap_v1 );
                }

                if ( beatmaps.length !== limit ){
                    console.log('done updating data');
                    is_continue = false;
                }
                
            } catch (e) {

                console.error(e);
                break;
            }
        }

        writeFileSync( saved_since_date_path, JSON.stringify({ since_date }), 'utf8' );
        
    }
}
*/