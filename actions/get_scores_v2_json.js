const { writeFileSync, existsSync } = require('fs');
const path = require('path');
const { v2 } = require('osu-api-extended');

const { gamemode, folder_prepare } = require("../tools/misc");

const { scores_folder_path } = require('../misc/const');
const get_scores_loop = require('../tools/get_scores_loop');

module.exports = async( args ) => {
    console.log('getting scores with v2 to jsons');

    await get_scores_loop({ args, init: async (userid) => {
        //check scores folder
        const scores_userdata_path = path.join(scores_folder_path, userid.toString());
        folder_prepare(scores_userdata_path);
        console.log('set scores folder', scores_userdata_path);

    }, callback: async ( beatmap, userid ) => {
        const scores_userdata_path = path.join(scores_folder_path, userid.toString());
        const output_name = beatmap.md5 + '.json';
        const output_path = path.join(scores_userdata_path, output_name);

        //skip existed score
        if (existsSync(output_path)){
            return true;
        }

        try {
            const data = await v2.scores.user.beatmap( beatmap.beatmap_id, userid, { mode: gamemode[beatmap.gamemode_int], best_only: false });
            
            if (!data || data.length === 0){
                // no scores for beatmap
            } else {
                console.log('founded new score, saving', output_path);
                writeFileSync(output_path, JSON.stringify(data), {encoding: 'utf8'});
            }

        } catch (e) {

            console.log( beatmap );
            console.error( e );
            return true;
            
        }

    }});

}