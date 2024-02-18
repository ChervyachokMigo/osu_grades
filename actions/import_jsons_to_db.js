
const { save_all_json_scores_v1, save_all_json_scores } = require("../modules/scores/json");
const { Num } = require("../tools/misc");

module.exports = async (args) => {
    //check scoring mode
    const score_mode = Num(args.shift(), 2);
    if (!score_mode || isNaN(score_mode) || score_mode < 1 || score_mode > 2 ){
        console.error('scoring mode invalid:', score_mode);
    }

    console.log('saving scores to db');

    if (score_mode === 1){
        console.log('[score mode] set legacy mode');
        await save_all_json_scores_v1();
    } else {
        console.log('[score mode] set v2 mode');
        await save_all_json_scores();
    }

}