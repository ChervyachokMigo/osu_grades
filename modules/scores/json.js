const { existsSync, readdirSync, readFileSync, rmSync, renameSync, writeFileSync } = require('fs');
const { RankedStatus } = require('osu-tools');
const path = require('path');
const { Op } = require('@sequelize/core');

const find_beatmaps = require('../../tools/find_beatmaps');

const { save_scores_v1, convert_v2_to_v1 } = require("./v1");
const { save_scores_v2 } = require("./v2");

const { scores_folder_path, scores_backup_path } = require('../../misc/const');
const { backup_instead_remove } = require('../../data/config');
const { folder_prepare } = require('../../tools/misc');

const import_json_user_scores_v1 = async ( userid, beatmaps_db ) => {
    const user_scores_path = path.join( scores_folder_path, userid.toString() );
    const user_scores_backup_path = path.join( scores_backup_path, userid.toString() );

    if (!existsSync(user_scores_path)){
        console.error('wrong user scores path', user_scores_path);
        return;
    }

    if (backup_instead_remove) {
        folder_prepare( user_scores_backup_path );
    }

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
            if ( backup_instead_remove ){
                renameSync( scores_json_path, path.join( user_scores_backup_path, score_json_name ) )
            } else {
                rmSync( scores_json_path );
            }
        });
        
    }
}

const import_json_user_scores = async ( userid ) => {
    const user_scores_path = path.join( scores_folder_path, userid.toString() );
    const user_scores_backup_path = path.join( scores_backup_path, userid.toString() );
    
    if (!existsSync(user_scores_path)){
        console.error('wrong user scores path', user_scores_path);
        return;
    }

    if (backup_instead_remove) {
        folder_prepare( user_scores_backup_path );
    }

    const scores_json_names = readdirSync(user_scores_path, 'utf8');
    for (let score_json_name of scores_json_names){
        const scores_json_path = path.join ( user_scores_path, score_json_name );
        const md5 = score_json_name.slice(0, score_json_name.length - 5);

        const scores = JSON.parse( readFileSync( scores_json_path, 'utf8' )).map( x => ({...x, md5 }));

        await save_scores_v2(scores).finally( () => {
            if ( backup_instead_remove ){
                renameSync( scores_json_path, path.join( user_scores_backup_path, score_json_name ) )
            } else {
                rmSync( scores_json_path );
            }
        });
    }
}

module.exports = {
    import_json_user_scores,
    import_json_user_scores_v1,

    import_all_json_scores: async () => {
        const userids = readdirSync( scores_folder_path, 'utf8' );
        for (let userid of userids) {
            console.log('saving scores for userid', userid);
            await import_json_user_scores(userid);
        }
    },

    import_all_json_scores_v1: async () => {
        //load beatmaps from DB
        const beatmaps_db = (await find_beatmaps({ 
            gamemode: { [Op.between]: [0, 3] }, 
            ranked: RankedStatus.ranked }))
            .filter( x => x.beatmap_id > 0 );

        console.log('founded', beatmaps_db.length, 'ranked beatmaps');

        const userids = readdirSync( scores_folder_path, 'utf8' );
        for (let userid of userids) {
            console.log('saving scores for userid', userid);
            await import_json_user_scores_v1(userid, beatmaps_db);
        }
    },

    save_score_v2_to_json: ( userid, score ) => {
        const scores_userdata_path = path.join( scores_folder_path, userid.toString() );
        const score_path = path.join( scores_userdata_path, score.beatmap.checksum + '.json' ); 

        //delete excess information
        const modified_score = Object.assign( {}, score );
        [ 'beatmap', 'beatmapset', 'user', 'position', 'mods_id' ]
            .forEach( p => delete modified_score[p] );

        const saved_scores = (existsSync(score_path) ? 
        [ ...JSON.parse( readFileSync( score_path, { encoding: 'utf8' })), modified_score ] : 
        [ modified_score ]).filter(( v, i, a) => a.findIndex( x => x.id === v.id ) === i );

        saved_scores.sort( (a, b) => b.total_score - a.total_score);

        writeFileSync(score_path, JSON.stringify(saved_scores), {encoding: 'utf8'});
    }
}