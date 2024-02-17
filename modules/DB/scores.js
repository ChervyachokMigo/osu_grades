const path = require('path');
const { existsSync, readdirSync, readFileSync, rmSync } = require('fs');

const { osu_score, beatmaps_md5 } = require("./defines")

const rank_to_int = {
    "F": 0,
    "D": 1,
    "C": 2,
    "B": 3,
    "A": 4,
    "S": 5,
    "X": 6,
    "SH": 7,
    'XH': 8
} 
const { scores_folder_path } = require('../../misc/const');

const get_md5_id = async (hash) => {
    if (hash && typeof hash !== 'string' && hash.length !== 32){
        return null;
    }

    const result = await beatmaps_md5.findOrCreate({ 
        where: { hash },
        logging: false
    });

    return result[0].getDataValue('id');
}

const convert_to_db_record_from_json = async ( score ) => {
    return {
        md5: await get_md5_id(score.md5),
        beatmap_id: score.beatmap_id,
        id: BigInt(score.id),
        legacy_id: BigInt(score.legacy_score_id ? score.legacy_score_id : 0),
        userid: score.user_id,
        gamemode: score.ruleset_id,
        rank: rank_to_int[score.rank],
        accuracy: score.accuracy,
        date: score.ended_at,
        total_score: score.total_score,
        legacy_total_score: BigInt(score.legacy_total_score ? score.legacy_total_score : 0),
        max_combo: score.max_combo,
        pp: score.pp ? score.pp : 0,
        mods: score.mods.map( x => x.acronym ).join('+'),
        passed: score.passed,
        ranked: score.ranked
    }
}

const save_score = async ( data ) => {
    const score = await convert_to_db_record_from_json( data );
    await osu_score.upsert( score, { logging: false, raw: true });
}

const save_scores = async ( data_arr ) => {
    const scores = await Promise.all( data_arr.map ( async x => await convert_to_db_record_from_json( x )));
    await osu_score.bulkCreate( scores, { ignoreDuplicates: true, logging: false } )
}

const save_json_scores = async ( userid ) => {
    const user_scores_path = path.join( scores_folder_path, userid.toString() );

    if (!existsSync(user_scores_path)){
        console.error('wrong user scores path', user_scores_path);
        return;
    }

    const scores_db = await osu_score.findAll({ where: { userid } ,logging: false, raw: true})

    const scores_json_names = readdirSync(user_scores_path, 'utf8');
    for (let score_json_name of scores_json_names){
        const score_json_path = path.join ( user_scores_path, score_json_name );
        const md5 = score_json_name.slice(0, score_json_name.length - 5);
        const scores_json = JSON.parse( readFileSync( score_json_path, 'utf8' )).map( x => { return {...x, md5 }});
        await save_scores(scores_json);
        rmSync(score_json_path);
    }
}

module.exports = {
    convert_to_db_record_from_json,
    save_score,
    save_scores,

    save_json_scores,

    save_all_json_scores: async () => {
        const userids = readdirSync( scores_folder_path, 'utf8' );
        for (let userid of userids) {
            console.log('saving scores for userid', userid);
            await save_json_scores(userid);
        }
    }

}