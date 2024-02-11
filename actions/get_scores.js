const { writeFileSync } = require('fs');
const path = require('path');
const { auth, v2 } = require('osu-api-extended');

const { folder_prepare } = require("../tools/misc");
const load_osu_db = require('../tools/load_osu_db');

const { RankedStatus } = require('osu-tools');
const { scores_folder_path } = require('../const');
const { login, password } = require('../config.js');

module.exports = async( args ) => {
    console.log('getting scores');

    //check userid
    const userid = Number(args.shift()) || null;
    if (!userid || isNaN(userid) || userid == 0){
        console.error('userid invalid:', userid);
        return;
    }

    //check continue
    let continue_md5 = args.shift() || null;
    if (continue_md5 && continue_md5.length !==32){
        console.error('[continue_md5] > wrong md5 hash');
        return;
    }
    let is_continue = continue_md5 ? true : false;

    //check scores folder
    folder_prepare(scores_folder_path);
    const scores_userdata_path = path.join(scores_folder_path, userid.toString());
    console.log('set scores folder', scores_userdata_path);

    //get osu db data
    const osu_db = load_osu_db();
    if (!osu_db){
        console.error('[osu_db] > is not exists');
        return;
    }

    //auth osu
    console.log('authing to osu');
    await auth.login_lazer( login, password );

    //start process
    console.log('starting to send requests');
    let i = -1;
    for (let x of osu_db){
        i++;
        
        //go to md5 and continue
        if (is_continue){
            if ( x.beatmap_md5 === continue_md5 ) {
                console.log('continue from', continue_md5);
                console.log('processed', (i/osu_db.length*100).toFixed(2), '% beatmaps');
                is_continue = false;
            } else {
                continue;
            }
        }

        //print percent every 1000 beatmaps
        if (i % 1000 == 0) {
            console.log('processed', (i/osu_db.length*100).toFixed(2), '% beatmaps');
        }

        const output_name = x.beatmap_md5 + '.json';
        const output_path = path.join(scores_userdata_path, output_name);

        if (x.ranked_status_int === RankedStatus.ranked && x.beatmap_id > 0){
            try {
                const data = await v2.scores.user.beatmap( x.beatmap_id, userid, { best_only: false });
                if ( !data || data.length == 0 ){
                    continue;
                }
                console.log('founded new score, saving', output_path)
                writeFileSync(output_path, JSON.stringify(data), {encoding: 'utf8'});

            } catch (e) {

                console.log( output_path, x);
                console.error(e);
                break;
                
            }
            
        }

    }
}