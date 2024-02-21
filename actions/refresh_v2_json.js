const path = require('path');

const refresh_users_loop = require('../tools/loops/refresh_users_loop');

const { folder_prepare } = require('../tools/misc');
const { save_scores_v2_to_json } = require('../modules/scores/json');
const { scores_folder_path } = require('../misc/const');
const { request_user_recent_scores_v2 } = require('../modules/osu_requests_v2');
const { found_new_X_scores_gamemode } = require('../misc/text_templates');

module.exports = {
    args: ['userid', 'gamemode'],
    action: async( args ) => {
        console.log('getting recent scores v2');

        await refresh_users_loop({ args, looping: true, init: (userid) => {
            //check scores folder
            const scores_userdata_path = path.join( scores_folder_path, userid.toString() );
            folder_prepare( scores_userdata_path );
            console.log( 'set scores folder', scores_userdata_path ); }, 
            callback: async ({ userid, ruleset, offset, limit }) => {
            try {
                const scores = await request_user_recent_scores_v2({ userid, ruleset, offset, limit});
                if ( !scores ) return false;
                
                const res = save_scores_v2_to_json({ userid, scores });
                if (res) 
                    console.log( found_new_X_scores_gamemode({ length: res, userid, gamemode_int: ruleset.idx }) );
                
                return scores.length;
            } catch (e) {
                console.error( e );
                return false;
            }
        }});
}}

