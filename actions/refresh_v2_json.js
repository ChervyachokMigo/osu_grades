const { v2 } = require('osu-api-extended');
const path = require('path');

const update_scores_by_user_recent = require('../tools/update_scores_by_user_recent');

const { folder_prepare } = require('../tools/misc');
const { save_scores_v2_to_json } = require('../modules/scores/json');
const { scores_folder_path } = require('../misc/const');

module.exports = {
    args: ['userid', 'gamemode'],
    action: async( args ) => {
        console.log('getting recent scores v2');

        await update_scores_by_user_recent({ args, init: (userid) => {
            //check scores folder
            const scores_userdata_path = path.join( scores_folder_path, userid.toString() );
            folder_prepare( scores_userdata_path );
            console.log( 'set scores folder', scores_userdata_path );

        }, callback: async ( userid, ruleset ) => {
            try {
                const loop = {
                    limit: 100,
                    receiving: true,
                    offset: 0,
                }

                while ( loop.receiving ) {

                    const data = await v2.scores.user.category( userid, 'recent', { mode: ruleset.name, offset: loop.offset, limit: loop.limit });
                    loop.offset += loop.limit;

                    if (!data || data.length === 0){
                        // no scores for beatmap
                        console.log( 'warning! not found scores for user', userid, 'with gamemode', ruleset.name );
                        return;
                    } 

                    if (data.length < loop.limit){
                        loop.receiving = false;
                    }
                    
                    const scores = data.map( response => ({ ...response, beatmap_md5: response.beatmap.checksum }));

                    const res = save_scores_v2_to_json({ userid, scores });
                    if (res) {
                        console.log( `found new ${res} scores by user ${userid}` );
                    }
            }} catch (e) {

                console.error( e );
                return;
            }
    }});
}}

