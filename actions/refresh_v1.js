const { save_scores_v1 } = require('../modules/scores/v1');
const update_scores_by_user_recent = require('../tools/update_scores_by_user_recent');
const find_beatmaps = require('../tools/find_beatmaps');
const { api_key } = require('../data/config');
const Axios = require('axios');
const { Num } = require('../tools/misc');

module.exports = async( args ) => {
    console.log('getting recent scores v1');

    await update_scores_by_user_recent({ args, callback: async ( userid, ruleset ) => {
        try {
            const url = `https://osu.ppy.sh/api/get_user_recent?k=${api_key}&u=${userid}&m=${ruleset.idx}&limit=50`;
            const res = await Axios( url );

            if (!res.data || res.data.length === 0){
                // no scores for beatmap
                console.log( 'warning! not found scores for user', userid, 'with gamemode', ruleset.name );
                return;
            } else {
                const scores = ( await Promise.all( await res.data
                    .filter( x => x.score_id && Num( x.beatmap_id ))
                    .map( async score => ({ score,
                        beatmap: await find_beatmaps({ beatmap_id: score.beatmap_id, single: true })}))))
                    .filter( x => x.beatmap );
                    
                if (scores.length == 0) {
                    console.log( 'warning! not found scores for user', userid, 'with gamemode', ruleset.name );
                } else {
                    await save_scores_v1( scores );                    
                }
            }
            
        } catch (e) {

            console.error( e );
            return;
            
        }

    }});

}