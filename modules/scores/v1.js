const { ModsIntToShortText } = require('osu-tools');

const { osu_score_legacy } = require("../DB/defines")
const { Num } = require('../../tools/misc');
const { get_md5_id, mods_v2_to_string } = require('../DB/tools');

const { rank_to_int } = require('../../misc/const');

const convert_v2_to_v1 = async ({ score, beatmap }) => ({
    score: {
        score_id: BigInt(score.legacy_score_id),
        user_id: Num(score.user_id),
        rank: score.rank,
        date: score.ended_at,
        score: Num(score.legacy_total_score),
        maxcombo: Num(score.max_combo),
        pp: Num(score.pp),
        mods: mods_v2_to_string( score.mods )
    },
    beatmap,
});

const score_v1_parse = async ({ beatmap, score }) => {
    if (!beatmap || !beatmap.md5){
        console.log({ beatmap, score })
        throw new Error('no beatmap')
    }
    
    return {
        md5: await get_md5_id(beatmap.md5),
        beatmap_id: Num(beatmap.beatmap_id),
        id: BigInt(score.score_id),
        userid: Num(score.user_id),
        gamemode: beatmap.gamemode,
        rank: rank_to_int[score.rank],
        date: score.date,
        total_score: Num(score.score),
        max_combo: Num(score.maxcombo),
        pp: Num(score.pp),
        mods: score.enabled_mods? ModsIntToShortText(Num(score.enabled_mods)).join('+'): score.mods,
}};


// v1
/**
 * @param beatmap
 * @param score
 */
const save_scores_v1 = async ( data_arr ) => {
    const scores = ( await Promise.all( 
        data_arr.filter( x => x && x.score && x.beatmap ).map( async x => await score_v1_parse( x )))
    );
    const res = await osu_score_legacy.bulkCreate( scores, { ignoreDuplicates: true, logging: false });
    return res.length;
}

module.exports = {
    convert_v2_to_v1,
    score_v1_parse,
    save_scores_v1,
}