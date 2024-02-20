const { v2 } = require('osu-api-extended');

module.exports = {

    request_beatmap_user_scores: async({ beatmap_id, userid, gamemode = undefined, 
            sort_condition = 'total_score', notice_miss = false }) => {

        const data = await v2.scores.user.beatmap( beatmap_id, userid, { mode: gamemode, best_only: false });

        if (data && typeof data == 'object' && data.length > 0){
            data.sort( (a, b) => b[sort_condition] - a[sort_condition] );            
            return data;
        }

        if (notice_miss) {
            console.error('warning: no scores for beatmap', beatmap_id );
        }

        return null;
    }
}