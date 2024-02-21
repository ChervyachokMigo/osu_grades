const { v2 } = require('osu-api-extended');

module.exports = {
    request_beatmap_user_scores_v2: async ({ beatmap_id, userid, gamemode = undefined, 
        sort_condition = 'total_score', notice_miss = false }) => {

        const data = await v2.scores.user.beatmap( beatmap_id, userid, { mode: gamemode, best_only: false });

        if (data && typeof data == 'object' && data.length > 0){
            data.sort( (a, b) => b[sort_condition] - a[sort_condition] );            
            return data;
        }

        if (notice_miss) {
            console.error('warning: no scores for beatmap', beatmap_id, 'for user', userid );
        }

        return null;
    },

    request_user_recent_scores_v2: async ({ userid, ruleset, offset = 0, limit = 100 }) => {
        const data = await v2.scores.user.category( userid, 'recent', { mode: ruleset.name, offset, limit });

        if (data && typeof data == 'object' && data.length > 0){
            return data.map( x => ({...x, beatmap_md5: x.beatmap.checksum }));;
        }

        console.error( 'warning! not found scores for user', userid, 'with gamemode', ruleset.name );
        return null;
    },
}