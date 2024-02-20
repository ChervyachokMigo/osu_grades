const axios = require('axios');

const find_beatmaps = require('../tools/find_beatmaps');
const { Num } = require('../tools/misc');

const { api_key } = require('../data/config');

module.exports = {
    request_user_beatmap_scores: async ({ beatmap, userid }) => {
        const url = `https://osu.ppy.sh/api/get_scores?k=${api_key}&b=${beatmap.beatmap_id}&u=${userid}&m=${beatmap.gamemode}`;
        const res = await axios( url );
        
        if (res && res.data && typeof res.data == 'object' && res.data.length > 0){
            const scores = res.data.map( score => ({ score, beatmap }));
            return scores;
        } else {
            return null;
        }
    },

    request_user_recent_scores: async ({ userid, ruleset }) => {
        const url = `https://osu.ppy.sh/api/get_user_recent?k=${api_key}&u=${userid}&m=${ruleset.idx}&limit=50`;
        const res = await axios( url );

        if (res && res.data && typeof res.data == 'object' && res.data.length > 0){
            const scores = ( await Promise.all( await res.data
                .filter( x => x.score_id && Num( x.beatmap_id ))
                .map( async score => ({ score,
                    beatmap: await find_beatmaps({ beatmap_id: score.beatmap_id, single: true })}))))
                .filter( x => x.beatmap );
                
            if (scores.length > 0) {
                return scores;
            }
        }

        console.log( 'warning! not found scores for user', userid, 'with gamemode', ruleset.name );
        return null;
    },

    request_beatmaps_by_date: async ({ since_date = null, limit = 500, gamemode }) => {
        const url = `https://osu.ppy.sh/api/get_beatmaps?k=${api_key}&since=${since_date}${ gamemode > 0 ? `&m=${gamemode}` : '' }&limit=${limit}`;
        const res = await axios( url );

        if ( res && res.data && typeof res.data == 'object' )
            return res.data;

        console.error('bancho not response beatmaps');
        return null;
    },

    request_beatmap_by_md5: async ({ md5 }) => {
        const url = `https://osu.ppy.sh/api/get_beatmaps?k=${api_key}&h=${md5}&limit=1`;
        const res = await axios( url );
        
        if ( res && res.data && typeof res.data == 'object' && res.data.length > 0 ) {
            return res.data.shift();
        }

        console.error( 'no beatmap info on bancho by md5', md5 );
        return null;
    },

    /**
     * 
     * @param beatmap set required
     * @param gamemode optional
     */
    request_beatmap_by_id: async ({ beatmap, gamemode }) => {
        const url = `https://osu.ppy.sh/api/get_beatmaps?k=${api_key}&b=${beatmap}${ gamemode > 0 ? `&m=${gamemode}` : '' }&limit=1`;
        const res = await axios( url );

        if ( res && res.data && typeof res.data == 'object' && res.data.length > 0 ) {
            return res.data.shift();
        }

        console.error( 'no beatmap info on bancho by beatmap id', beatmap );
        return null;
    },

    request_user_info: async ({ userid }) => {
        const url = `https://osu.ppy.sh/api/get_user?k=${api_key}&u=${userid}`;
        const res = await axios( url );
        
        if ( res && res.data && typeof res.data == 'object' && res.data.length > 0 ) {
            return res.data.shift();
        }

        console.error('userid is not exists on bancho', userid)
        return null;
    }

}