const { v2 } = require('osu-api-extended');
const { save_scores_v2 } = require('../modules/scores/v2');
const update_scores_by_user_recent = require('../tools/update_scores_by_user_recent');

module.exports = {
    args: ['userid', 'gamemode'],
    action: async( args ) => {
        console.log('getting recent scores v2');

        await update_scores_by_user_recent({ args, callback: async ( userid, ruleset ) => {
            try {
                const loop = {
                    limit: 100,
                    receiving: true,
                    offset: 0,
                }

                while ( loop.receiving ) {

                    const data = await v2.scores.user.category(userid, 'recent', { mode: ruleset.name, offset: loop.offset, limit: loop.limit });
                    loop.offset += loop.limit;

                    if (!data || data.length === 0){
                        // no scores for beatmap
                        console.log( 'warning! not found scores for user', userid, 'with gamemode', ruleset.name );
                        return;
                    } 

                    if (data.length < loop.limit){
                        loop.receiving = false;
                    }
                    
                    const scores = data.map( x => ({...x, md5: x.beatmap.checksum }));
                    await save_scores_v2( scores );
                    console.log('receiving', scores.length, 'scores');

            }} catch (e) {
                console.error( e );
                return;
            }
    }});
}}
