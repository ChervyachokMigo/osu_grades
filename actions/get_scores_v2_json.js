const path = require('path');

const { folder_prepare } = require("../tools/misc");
const get_scores_loop = require('../tools/get_scores_loop');
const { save_scores_v2_to_json } = require('../modules/scores/json');
const { request_beatmap_user_scores_v2 } = require('../modules/osu_requests_v2');
const { scores_folder_path, gamemode } = require('../misc/const');

module.exports = {
    args: ['userid', 'gamemode', 'continue_md5'],
    action: async( args ) => {
        console.log('getting scores with v2 to jsons');

        await get_scores_loop({ args, init: async ( userid ) => {
            //check scores folder
            const scores_userdata_path = path.join(scores_folder_path, userid.toString());
            folder_prepare(scores_userdata_path);
            console.log('set scores folder', scores_userdata_path); }, 
        callback: async ( beatmap, userid ) => {
            try {
                const data = await request_beatmap_user_scores_v2({ 
                    beatmap_id: beatmap.beatmap_id, 
                    gamemode: gamemode[beatmap.gamemode_int],
                    userid, });
                
                if (data){
                    const scores = data.map( score => ({ ...score, beatmap_md5: beatmap.md5 }));

                    const res = save_scores_v2_to_json({ userid, scores });
                    if (res) {
                        console.log( `found new scores ${res} of beatmap ${beatmap.md5} by user ${userid}` );
                    }
                } 
                
            } catch (e) {
                console.log( 'beatmap', beatmap );
                console.error( e );
                return true;
            }
    }});
}}