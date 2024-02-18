const { v2 } = require('osu-api-extended');
const path = require('path');

const osu_auth = require('../tools/osu_auth');
const { check_gamemode, folder_prepare, check_userid } = require('../tools/misc');
const { scores_folder_path } = require('../misc/const');
const { save_scores_v1 } = require('../modules/scores/v1');

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
    console.log('finding scores');/*
    try {
        
        const loop = {
            limit: 100,
            receiving: true,
            offset: 0
        }

        while ( loop.receiving ) {
            const data = await v2.scores.user.category(userid, 'recent', { mode: ruleset.name, offset: loop.offset, limit: loop.limit });
            loop.offset += loop.limit;

            if (!data || data.length === 0){
                console.error('warning:', 'not scores for gamemode', ruleset.name, 'for user', userid);
                break;
            }

            if (data.length < loop.limit){
                loop.receiving = false;
            }

            const scores = data.map( x => ({...x, md5: x.beatmap.checksum }));
            await save_scores_v1(scores);

            console.log('receiving', scores.length, 'scores');

        }

    } catch (e) {
        console.log( userid );
        console.error(e);
        return;
    }*/

}