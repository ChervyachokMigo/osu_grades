const { writeFileSync, existsSync } = require('fs');
const path = require('path');
const { v2 } = require('osu-api-extended');

const { folder_prepare } = require("../tools/misc");

const { scores_folder_path, gamemode } = require('../misc/const');
const get_scores_loop = require('../tools/get_scores_loop');
const { save_score_v2_to_json } = require('../modules/scores/json');

module.exports = {
    args: ['userid', 'gamemode', 'continue_md5'],
    action: async( args ) => {
        console.log('getting scores with v2 to jsons');

        await get_scores_loop({ args, init: async ( userid ) => {
            //check scores folder
            const scores_userdata_path = path.join(scores_folder_path, userid.toString());
            folder_prepare(scores_userdata_path);
            console.log('set scores folder', scores_userdata_path);

        }, callback: async ( beatmap, userid ) => {
            try {
                const data = await v2.scores.user.beatmap( beatmap.beatmap_id, userid, { mode: gamemode[beatmap.gamemode_int], best_only: false });
                    
                if (data && data.length > 0){
                    for (let score of data){ 
                        console.log('found new score', beatmap.md5 );
                        save_score_v2_to_json(userid, {...score, beatmap: { checksum: beatmap.md5 }});
                    }
                } 
                
                // else no data for user on beatmap

            } catch (e) {
                console.log( beatmap );
                console.error( e );
                return true;
            }
    }});
}}