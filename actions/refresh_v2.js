const { save_scores_v2 } = require('../modules/scores/v2');
const update_user_recent_scores_loop = require('../tools/update_user_recent_scores_loop');
const { request_user_recent_scores_v2 } = require('../modules/osu_requests_v2');

module.exports = {
    args: ['userid', 'gamemode'],
    action: async( args ) => {
        console.log('getting recent scores v2');

        await update_user_recent_scores_loop({ args, looping: true, 
            callback: async ({ userid, ruleset, offset, limit }) => {
                try {
                    const data = await request_user_recent_scores_v2({ userid, ruleset, offset, limit });
                    if ( !data ) return false;

                    await save_scores_v2( data );
                    if (data.length)
                        console.log( `found ${data.length} scores for user ${userid}` );
                    
                    return data.length;
                } catch (e) {
                    console.error( e );
                    return false;
                }
    }});
}}
