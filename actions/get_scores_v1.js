const axios = require('axios');
const { writeFileSync } = require('fs');
const path = require('path');

const { RankedStatus } = require('osu-tools');

const osu_auth = require('../tools/osu_auth');
const { folder_prepare, check_gamemode } = require("../tools/misc");
const load_osu_db = require('../tools/load_osu_db');

const { scores_v1_folder_path } = require('../const');
const { api_key } = require('../config');


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

    //check gamemode
    const ruleset = check_gamemode(Number(args.shift()));

    //check scores folder
    const scores_userdata_path = path.join(scores_v1_folder_path, userid.toString());
    folder_prepare(scores_userdata_path);
    console.log('set scores folder', scores_userdata_path);

    //get osu db data
    const osu_db = load_osu_db();
    if (!osu_db){
        console.error('[osu_db] > is not exists');
        return;
    }

    //auth osu
    console.log('authing to osu');
    await osu_auth();

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

        //skip gamemodes
        if ( ruleset.idx > -1 && x.gamemode_int !== ruleset.idx ){
            continue;
        }

        const output_name = x.beatmap_md5 + '.json';
        const output_path = path.join(scores_userdata_path, output_name);

        //skip existed score
        if (existsSync(output_path)){
            continue;
        }

        //print percent every 1000 beatmaps
        if (i % 1000 == 0) {
            console.log('processed', (i/osu_db.length*100).toFixed(2), '% beatmaps');
        }

        if (x.ranked_status_int === RankedStatus.ranked && x.beatmap_id > 0){
            try {
                const url = `https://osu.ppy.sh/api/get_scores?k=${api_key}&b=${x.beatmap_id}&u=${userid}&m=${x.gamemode_int}`;
                const { data } = await axios(url);
                if (!data || data.length === 0){
                    console.error('warning:', 'not scores for beatmap', x.beatmap_id);
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