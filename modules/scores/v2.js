
const { osu_score } = require("../DB/defines")
const { Num } = require('../../tools/misc');
const { get_md5_id, mods_v2_to_string } = require("../DB/tools");

const { rank_to_int } = require("../../misc/const");

const _this = module.exports = {
    convert_v2_to_db: async ( score ) => ({
        md5: await get_md5_id(score.beatmap_md5),
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
        pp: Num(score.pp),
        mods: mods_v2_to_string( score.mods ),
        passed: score.passed,
        ranked: score.ranked
    }),
    // Single score
    save_score_v2: async ( data ) => {
        const score = await _this.convert_v2_to_db( data );
        const res = await osu_score.upsert( score, { logging: false, raw: true });
        return res.pop();
    },
    // Multiple scores
    save_scores_v2: async ( data_arr ) => {
        const scores = await Promise.all( 
            data_arr.filter( x => x && x.id ).map ( async x => await _this.convert_v2_to_db( x ))
        );
        
        const res = await osu_score.bulkCreate( scores, { ignoreDuplicates: true, logging: false });
        return res.length;
    },
}