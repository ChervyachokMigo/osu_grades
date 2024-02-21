const { save_scores_v1 } = require('../modules/scores/v1');
const update_user_recent_scores_loop = require('../tools/update_user_recent_scores_loop');
const { request_user_recent_scores } = require('../modules/osu_requests_v1');

module.exports = {
    args: ['userid', 'gamemode'],
    action: async( args ) => {
        console.log('getting recent scores v1');

        await update_user_recent_scores_loop({ args, looping: false, 
            callback: async ({ userid, ruleset }) => {
                try {
                    const data = await request_user_recent_scores({ userid, ruleset });
                    if ( !data ) return false;

                    await save_scores_v1( data ); 
                    if (data.length)
                        console.log( `found ${data.length} scores for user ${userid}` );
                    
                    return data.length;
                } catch (e) {
                    console.error( e );
                    return false;
                }
        }});
    }
}