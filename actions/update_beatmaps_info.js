const axios = require("axios");
const { existsSync, readFileSync, writeFileSync } = require("fs");

const save_beatmap_info = require("../modules/beatmaps/save_beatmap_info");

const { convert_ranked, Num } = require("../tools/misc");
const { api_key } = require("../data/config");
const { saved_since_date_path } = require("../misc/const");

const since_date_start = '2007-01-01';
const limit = 500;

module.exports = async () => {
    let is_continue = true;

    let since_date = existsSync( saved_since_date_path ) ? JSON.parse( readFileSync( saved_since_date_path, 'utf8' )).since_date : since_date_start;

    while ( is_continue ) {
        console.log( 'get beatmaps since', since_date );
        try {
            const response = (await axios(`https://osu.ppy.sh/api/get_beatmaps?k=${api_key}&since=${since_date}&limit=${limit}`));

            if ( !response || !response.data ) {
                console.error('bancho not response');
                break;
            }
            
            for (let beatmap of response.data) {
                since_date = beatmap.approved_date;
                await save_beatmap_info({
                    checksum: beatmap.file_md5,
                    beatmap_id: Num(beatmap.beatmap_id),
                    beatmapset_id: Num(beatmap.beatmapset_id),
                    gamemode: Num(beatmap.mode),
                    ranked: convert_ranked(Number(beatmap.approved)),
                    artist: beatmap.artist || beatmap.artist_unicode || '',
                    title: beatmap.title || beatmap.title_unicode || '',
                    creator: beatmap.creator || '',
                    difficulty: beatmap.version || ''
                });
            }

            if ( response.data.length !== limit ){
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
