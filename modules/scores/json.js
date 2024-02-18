const { existsSync, readdirSync, readFileSync, rmSync } = require('fs');
const { RankedStatus } = require('osu-tools');
const path = require('path');
const { Op } = require('@sequelize/core');

const find_beatmaps = require('../../tools/find_beatmaps');

const { save_scores_v1, convert_v2_to_v1 } = require("./v1");
const { save_scores_v2 } = require("./v2");

const { scores_folder_path } = require('../../misc/const');

const save_json_scores_v1 = async ( userid, beatmaps_db ) => {
    const user_scores_path = path.join( scores_folder_path, userid.toString() );

    if (!existsSync(user_scores_path)){
        console.error('wrong user scores path', user_scores_path);
        return;
    }

    //const scores_db = await osu_score.findAll({ where: { userid } ,logging: false, raw: true})

    const scores_json_names = readdirSync(user_scores_path, 'utf8');
    for (let score_json_name of scores_json_names){
        const scores_json_path = path.join ( user_scores_path, score_json_name );
        const md5 = score_json_name.slice(0, score_json_name.length - 5);
        const beatmap = beatmaps_db.find( x => x.md5 === md5 );

        if (!beatmap){
            console.error(`warining! beatmap ${md5} is not exists in DB, skipping score `);
            continue;
        }

        const scores = await Promise.all( 
            JSON.parse( readFileSync( scores_json_path, 'utf8' ))
            .map( async score => await convert_v2_to_v1({ score, beatmap })));

        await save_scores_v1(scores).finally( () => {
            rmSync( scores_json_path );
        });
        
    }
}

const save_json_scores = async ( userid ) => {
    const user_scores_path = path.join( scores_folder_path, userid.toString() );

    if (!existsSync(user_scores_path)){
        console.error('wrong user scores path', user_scores_path);
        return;
    }

    //const scores_db = await osu_score.findAll({ where: { userid } ,logging: false, raw: true})

    const scores_json_names = readdirSync(user_scores_path, 'utf8');
    for (let score_json_name of scores_json_names){
        const scores_json_path = path.join ( user_scores_path, score_json_name );
        const md5 = score_json_name.slice(0, score_json_name.length - 5);

        const scores = JSON.parse( readFileSync( scores_json_path, 'utf8' )).map( x => ({...x, md5 }));

        await save_scores_v2(scores).finally( () => {
            rmSync( scores_json_path );
        });
    }
}

module.exports = {
    save_json_scores,

    save_all_json_scores: async () => {
        const userids = readdirSync( scores_folder_path, 'utf8' );
        for (let userid of userids) {
            console.log('saving scores for userid', userid);
            await save_json_scores(userid);
        }
    },

    save_all_json_scores_v1: async () => {
        //load beatmaps from DB
        const beatmaps_db = (await find_beatmaps({ 
            gamemode: { [Op.between]: [0, 3] }, 
            ranked: RankedStatus.ranked }))
            .filter( x => x.beatmap_id > 0 );

        console.log('founded', beatmaps_db.length, 'beatmaps');

        const userids = readdirSync( scores_folder_path, 'utf8' );
        for (let userid of userids) {
            console.log('saving scores for userid', userid);
            await save_json_scores_v1(userid, beatmaps_db);
        }
    }
}