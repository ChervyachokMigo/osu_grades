const { existsSync, readdirSync, readFileSync, rmSync, renameSync, writeFileSync } = require('fs');
const path = require('path');

const find_beatmaps = require('../../tools/find_beatmaps');
const { save_scores_v1, convert_v2_to_v1 } = require("./v1");
const { save_scores_v2 } = require("./v2");
const { folder_prepare, print_processed, util } = require('../../tools/misc');
const save_beatmap_info = require('../beatmaps/save_beatmap_info');
const { request_beatmap_by_md5, request_beatmap_by_id } = require('../osu_requests_v1');

const { scores_folder_path, scores_backup_path } = require('../../misc/const');
const { backup_instead_remove, print_progress_import_jsons_frequency } = require('../../data/config');

/**
 * @returns converted score and beatmap data
 * @returns readed score_v2 if beatmap not found
 */
const get_scores_v1_from_v2_json = async ({ filepath, beatmap }) => {
    const scores = JSON.parse( readFileSync( filepath, 'utf8' ));

    if (beatmap) {
        const converted_scores =  await Promise.all( scores.map( 
            async score => await convert_v2_to_v1({ score, beatmap })));
        return converted_scores;
    } else {
        return scores.map( x => ({ score_v2: x }));
    }
} 

const import_json_user_scores_v1 = async ( userid ) => {
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


    for ( let i in scores_json_names ){
        print_processed({ current: i, size: scores_json_names.length, frequency: print_progress_import_jsons_frequency, name: 'scores' });

        const scores_json_path = path.join ( user_scores_path, scores_json_names[i] );
        const md5 = scores_json_names[i].slice(0, scores_json_names[i].length - 5);
        let beatmap = await find_beatmaps({ beatmap_md5: md5, single: true });

        // trying to get beatmap info from bancho, first by md5, second by get beatmap id and request again
        if (!beatmap){
            let beatmap_v1 = await request_beatmap_by_md5({ md5 })
            if (!beatmap_v1) {
                const scores_v2 = await get_scores_v1_from_v2_json({ filepath: scores_json_path });
                const beatmap_id = scores_v2[0].score_v2.beatmap_id;
                const ruleset_id = scores_v2[0].score_v2.ruleset_id;
                
                beatmap_v1 = await request_beatmap_by_id({ beatmap: beatmap_id });
                if (!beatmap_v1) continue; // beatmap not found, no variants

            }

            beatmap = await save_beatmap_info( beatmap_v1 );
            if (!beatmap) {
                console.error( '[Error] cant save beatmap', beatmap_v1 );
                continue;
            }
        }

        const scores = await get_scores_v1_from_v2_json({ filepath: scores_json_path, beatmap });

        await save_scores_v1( scores ).finally( () => {
            if ( backup_instead_remove ){
                renameSync( scores_json_path, path.join( user_scores_backup_path, scores_json_names[i] ));
            } else {
                rmSync( scores_json_path );
            }
        });
        
    }
}

const import_json_user_scores_v2 = async ( userid ) => {
    const user_scores_path = path.join( scores_folder_path, userid.toString() );
    const user_scores_backup_path = path.join( scores_backup_path, userid.toString() );
    
    if (!existsSync( user_scores_path )){
        console.error( 'wrong user scores path', user_scores_path );
        return;
    }

    if (backup_instead_remove) {
        folder_prepare( user_scores_backup_path );
    }

    const scores_json_names = readdirSync( user_scores_path, 'utf8' );
    for ( let i in scores_json_names ){
        print_processed({ current: i, size: scores_json_names.length, frequency: print_progress_import_jsons_frequency, name: 'scores' });
        const scores_json_path = path.join ( user_scores_path, scores_json_names[i] );
        const md5 = scores_json_names[i].slice( 0, scores_json_names[i].length - 5 );

        const scores = JSON.parse( readFileSync( scores_json_path, 'utf8' )).map( x => ({...x, md5 }));

        await save_scores_v2(scores).finally( () => {
            if ( backup_instead_remove ){
                renameSync( scores_json_path, path.join( user_scores_backup_path, scores_json_names[i] ));
            } else {
                rmSync( scores_json_path );
            }
        });
    }
}

module.exports = {
    import_json_user_scores_v1,
    import_json_user_scores_v2,

    import_all_json_scores_v1: async () => {
        const userids = readdirSync( scores_folder_path, 'utf8' );
        for ( let userid of userids ) {
            console.log( 'saving scores for userid', userid );
            await import_json_user_scores_v1( userid );
        }
    },

    import_all_json_scores_v2: async () => {
        const userids = readdirSync( scores_folder_path, 'utf8' );
        for ( let userid of userids ) {
            console.log( 'saving scores for userid', userid );
            await import_json_user_scores_v2( userid );
        }
    },



    save_score_v2_to_json: ( userid, score ) => {
        const scores_userdata_path = path.join( scores_folder_path, userid.toString() );
        const score_path = path.join( scores_userdata_path, score.beatmap.checksum + '.json' ); 

        //delete excess information
        const modified_score = Object.assign( {}, score );
        [ 'beatmap', 'beatmapset', 'user', 'position', 'mods_id' ]
            .forEach( p => delete modified_score[p] );

        const is_old_score = existsSync( score_path );

        const saved_scores = ( is_old_score ? 
        [ ...JSON.parse( readFileSync( score_path, { encoding: 'utf8' })), modified_score ] : 
        [ modified_score ]).filter(( v, i, a ) => a.findIndex( x => x.id === v.id ) === i );

        const before_sort_length = saved_scores.length;
        saved_scores.sort( (a, b) => b.total_score - a.total_score);

        //save if only new score
        if ( !is_old_score || ( is_old_score && saved_scores.length !== before_sort_length )) {
            console.log( 'founded new score, saving', score_path );
            writeFileSync( score_path, JSON.stringify( saved_scores ), { encoding: 'utf8' });
        }
    }
}

