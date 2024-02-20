
const { v2 } = require('osu-api-extended');

const get_scores_loop = require('../tools/get_scores_loop');
const { save_scores_v2 } = require('../modules/scores/v2');
const { gamemode } = require('../misc/const');

module.exports = {
    args: ['userid', 'gamemode', 'continue_md5'],
    action: async( args ) => {
        console.log('getting scores with v2');

        await get_scores_loop({ args, callback: async ( beatmap, userid ) => {
            try {
                const data = await v2.scores.user.beatmap( beatmap.beatmap_id, userid, { mode: gamemode[beatmap.gamemode], best_only: false });
                
                if (data && data.length > 0){
                    const scores = data.map( x => ({ ...x, md5: beatmap.md5 }));
                    const res = await save_scores_v2( scores );
                    if (res) {
                        console.log('found new score', beatmap.md5 );
                    }
                }

            } catch (e) {
                console.log( beatmap );
                console.error( e );
                return true;
            }
    }});
}}