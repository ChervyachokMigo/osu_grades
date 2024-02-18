const { ModsIntToShortText } = require('osu-tools');

const { osu_score_legacy } = require("../DB/defines")
const { Num } = require('../../tools/misc');
const { get_md5_id, mods_v2_to_string } = require('../DB/tools');
const { rank_to_int } = require('../../misc/const');

const convert_v2_to_v1 = async ({ score, beatmap }) => ({
    score: {
        score_id: BigInt(score.legacy_score_id ? score.legacy_score_id : 0),
        user_id: Num(score.user_id),
        rank: rank_to_int[score.rank],
        date: score.ended_at,
        score: Num(score.legacy_total_score),
        max_combo: Num(score.max_combo),
        pp: Num(score.pp),
        mods: mods_v2_to_string( score.mods )
    },
    beatmap,
});

const score_v1_parse = async ({ beatmap, score }) => ({
    md5: await get_md5_id(beatmap.md5),
    beatmap_id: Num(beatmap.beatmap_id),
    id: BigInt(score.score_id),
    userid: Num(score.user_id),
    gamemode: beatmap.gamemode,
    rank: rank_to_int[score.rank],
    date: score.date,
    total_score: Num(score.score),
    max_combo: Num(score.max_combo),
    pp: Num(score.pp),
    mods: score.enabled_mods? ModsIntToShortText(Num(score.enabled_mods)).join('+'): score.mods,
});

// v1
/**
 * @param beatmap
 * @param score
 */
const save_scores_v1 = async ( data_arr ) => {
    const scores = await Promise.all( data_arr.map ( async x => await score_v1_parse( x )));
    await osu_score_legacy.bulkCreate( scores, { ignoreDuplicates: true, logging: false });
}

module.exports = {
    convert_v2_to_v1,
    score_v1_parse,
    save_scores_v1,
}