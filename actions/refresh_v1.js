const { save_scores_v1 } = require('../modules/scores/v1');
const update_scores_by_user_recent = require('../tools/update_scores_by_user_recent');
const { request_user_recent_scores } = require('../modules/osu_requests_v1');

module.exports = {
    args: ['userid', 'gamemode'],
    action: async( args ) => {
        console.log('getting recent scores v1');

        await update_scores_by_user_recent({ args, callback: async ( userid, ruleset ) => {
            try {
                const scores = await request_user_recent_scores({ userid, ruleset });
                if (scores) await save_scores_v1( scores ); 
                
            } catch (e) {
                console.error( e );
                return;
            }
        }});
    }
}