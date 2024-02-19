const get_scores_loop = require('../tools/get_scores_loop');
const { save_scores_v1 } = require('../modules/scores/v1');
const { request_user_beatmap_scores } = require('../modules/osu_requests_v1');

module.exports = {
    args: ['userid', 'gamemode', 'continue_md5'],
    action: async( args ) => {
        console.log('getting scores with v1');

        await get_scores_loop({ args, callback: async ( beatmap, userid ) => {
            try {
                const scores = await request_user_beatmap_scores({ beatmap, userid })
                if (scores) await save_scores_v1( scores );

            } catch (e) {
                console.log( beatmap );
                console.error( e );
                return true;
            }
    }});
}}
