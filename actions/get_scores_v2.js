
const { v2 } = require('osu-api-extended');
const get_scores_loop = require('../tools/get_scores_loop');
const { save_scores_v2 } = require('../modules/scores/v2');
const { gamemode } = require('../misc/const');

module.exports = async( args ) => {
    console.log('getting scores with v2');

    await get_scores_loop({ args, callback: async ( beatmap, userid ) => {
        try {
            console.log('requesting beatmap', beatmap.md5 );
            const data = await v2.scores.user.beatmap( beatmap.beatmap_id, userid, { mode: gamemode[beatmap.gamemode], best_only: false });
            
            if (!data || data.length === 0){
                // no scores for beatmap
            } else {
                const scores = data.map( x => ({...x, md5: beatmap.md5 }));
                await save_scores_v2(scores);
            }

        } catch (e) {

            console.log( beatmap );
            console.error( e );
            return true;

        }

    }});

}