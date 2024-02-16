const { v2 } = require('osu-api-extended');
const path = require('path');

const osu_auth = require('../tools/osu_auth');
const { check_gamemode, folder_prepare, check_userid } = require('../tools/misc');
const { scores_folder_path } = require('../misc/const');
const { existsSync, writeFileSync, readFileSync } = require('fs');


module.exports = async( args ) => {
    console.log('getting recent scores');

    const userid = check_userid(args.shift());
    if (!userid) return;

    //check gamemode
    const ruleset = check_gamemode(args.shift());

    //check scores folder
    const scores_userdata_path = path.join(scores_folder_path, userid.toString());
    folder_prepare(scores_userdata_path);
    console.log('set scores folder', scores_userdata_path);

    //auth osu
    console.log('authing to osu');
    await osu_auth();

    //start process
    console.log('finding scores');
    try {
        
        let receiving = true;
        const limit = 100;
        let offset = 0;

        while ( receiving ) {
            const data = await v2.scores.user.category(userid, 'recent', {mode: ruleset.name, offset, limit});

            console.log('receiving', data.length,'scores');
            if (!data || data.length === 0){
                console.error('warning:', 'not scores for gamemode', ruleset.name, 'for user', userid);
                return;
            }

            offset += limit;

            if (data.length < limit){
                receiving = false;
            }
        
            for (let score of data){

                const score_path = path.join( scores_userdata_path, score.beatmap.checksum + '.json' ); 

                let modify_score = Object.assign( {}, score );
                //delete excess information
                const delete_props = ['beatmap', 'beatmapset', 'user', 'position', 'mods_id'];
                for (let prop of delete_props){
                    delete modify_score[prop];
                }

                if ( existsSync(score_path) ) {

                    let saved_scores = JSON.parse(readFileSync(score_path, { encoding: 'utf8' }));
                    const is_score_saved = saved_scores.findIndex( x => modify_score.id === x.id ) > -1;

                    if ( !is_score_saved ){
                        saved_scores.push(score);
                        saved_scores.sort( (a, b) => b.total_score - a.total_score);

                        console.log('founded new score, saving', score_path);
                        writeFileSync(score_path, JSON.stringify(saved_scores), {encoding: 'utf8'});

                    } else {
                        //score is saved, nothing to do

                        //console.log('score alredy saved', score_path);

                    }

                } else {

                    console.log('founded new score, saving', score_path);
                    writeFileSync(score_path, JSON.stringify([modify_score]), {encoding: 'utf8'});

                }
            }
        }

    } catch (e) {

        console.log( userid );
        console.error(e);
        return;
        
    }

}