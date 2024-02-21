const { existsSync, readdirSync, readFileSync, rmSync, renameSync, writeFileSync } = require('fs');
const path = require('path');

const find_beatmaps = require('../../tools/find_beatmaps');
const { save_scores_v1, convert_v2_to_v1 } = require("./v1");
const { save_scores_v2 } = require("./v2");
const { folder_prepare, print_processed, util, group_by } = require('../../tools/misc');
const { save_beatmap_info } = require('../DB/beatmap');
const { request_beatmap_by_md5, request_beatmap_by_id } = require('../osu_requests_v1');

const { scores_folder_path, scores_backup_path } = require('../../misc/const');
const { backup_instead_remove, print_progress_import_jsons_frequency } = require('../../data/config');

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

        const json_filepath = path.join ( user_scores_path, scores_json_names[i] );
        const md5 = scores_json_names[i].slice(0, scores_json_names[i].length - 5);
        let beatmap = await find_beatmaps({ beatmap_md5: md5, single: true });

        // find beatmap from different sources,
        // first from osu v1 by md5, then from osu v1 by beatmap_id
        if ( !beatmap ){
            let response_beatmap = await request_beatmap_by_md5({ md5 });
            if ( !response_beatmap ) { 
                const scores_v2 = JSON.parse( readFileSync( json_filepath, 'utf8' ));
                if (scores_v2.length == 0) continue;
                
                const beatmap_id = scores_v2[0].beatmap_id;
                
                response_beatmap = await request_beatmap_by_id({ beatmap: beatmap_id });
                if (!response_beatmap) continue; // beatmap not found, no variants
            }

            beatmap = await save_beatmap_info( response_beatmap );
            if (!beatmap) {
                console.error( '[Error] cant save beatmap', response_beatmap );
                continue;
            }
        }

        // read scores, filter if legacy_score_id is exists
        const scores = (JSON.parse( readFileSync( json_filepath, 'utf8' ))).filter( x => x.legacy_score_id );

        // convert scores to v1
        const converted_scores = await Promise.all( 
            scores.map( async score => await convert_v2_to_v1({ score, beatmap }))
        );

        //save scores to db
        await save_scores_v1( converted_scores ).finally( () => {
            if ( backup_instead_remove ){
                const backup_beatmap_scores_path = path.join( user_scores_backup_path, scores_json_names[i] );
                renameSync( json_filepath, backup_beatmap_scores_path );
            } else {
                rmSync( json_filepath );
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
        const beatmap_md5 = scores_json_names[i].slice( 0, scores_json_names[i].length - 5 );

        const scores = JSON.parse( readFileSync( scores_json_path, 'utf8' ));

        const res = await save_scores_v2(scores).finally( () => {
            if ( backup_instead_remove ){
                renameSync( scores_json_path, path.join( user_scores_backup_path, scores_json_names[i] ));
            } else {
                rmSync( scores_json_path );
            }
        });
        if (res) {
            console.log( `found ${res} scores of beatmap ${beatmap_md5} by user ${userid}` );
        }
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

    save_scores_v2_to_json: ({ userid, scores, sort_condition = 'total_score' }) => {
        const scores_grouped_by_md5 = Object.entries(group_by(scores, 'beatmap_md5'));

        let saves_scores_length = 0;

        scores_grouped_by_md5.forEach( ([beatmap_md5, beatmap_scores]) => {
            const scores_userdata_path = path.join( scores_folder_path, userid.toString() );
            const score_path = path.join( scores_userdata_path, beatmap_md5 + '.json' ); 
            
            //delete excess information
            beatmap_scores.forEach( score => {
                [ 'beatmap', 'beatmapset', 'user', 'position', 'mods_id' ]
                    .forEach( p => delete score[p] );
            });

            // if scores of beatmap is exists load and add new score
            // else save new score
            const is_old_score = existsSync( score_path );
            const saved_scores = ( is_old_score 
                ? [ ...JSON.parse( readFileSync( score_path, { encoding: 'utf8' })), ...beatmap_scores ] 
                : beatmap_scores ) 
            //filter unique by score id
                .filter(( v, i, a ) => a.findIndex( x => x.id === v.id ) === i );

            // sorting by total score
            const length_before_sort = saved_scores.length;
            saved_scores.sort( (a, b) => b[sort_condition] - a[sort_condition] );

            // save if only new score
            if ( !is_old_score || ( is_old_score && saved_scores.length !== length_before_sort )) {
                writeFileSync( score_path, JSON.stringify( saved_scores ), { encoding: 'utf8' });
                saves_scores_length++;
            }

        });

        return saves_scores_length;
    }
}

