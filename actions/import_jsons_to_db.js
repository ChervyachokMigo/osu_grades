
const { import_all_json_scores_v1, import_all_json_scores_v2 } = require("../modules/scores/json");
const { Num } = require("../tools/misc");

module.exports = {
    args: ['score_mode'],
    action: async( args ) => {
        //check scoring mode
        const score_mode = Num(args.score_mode, 2);
        if (!score_mode || isNaN(score_mode) || score_mode < 1 || score_mode > 2 ){
            console.error('scoring mode invalid:', score_mode);
        }

        console.log('importing scores to db');

        if (score_mode === 1){
            console.log('[score mode] set legacy mode');
            await import_all_json_scores_v1();
        } else {
            console.log('[score mode] set v2 mode');
            await import_all_json_scores_v2();
        }
    }
}