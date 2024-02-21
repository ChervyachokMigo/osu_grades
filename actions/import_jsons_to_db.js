
const { import_all_json_scores_v1, import_all_json_scores_v2 } = require('../modules/scores/json');
const { check_score_mode } = require('../tools/misc');
const { text_score_mode } = require('../misc/const');

module.exports = {
	args: ['score_mode'],
	action: async( args ) => {
		console.log('importing scores to db');

		const score_mode = (( v = check_score_mode( args.score_mode )) => v > 2 ? 2 : v )();
		if (!score_mode) return;
		
		console.log( `=== selected score ${text_score_mode[score_mode]} mode` );        

		if (score_mode === 1){
			await import_all_json_scores_v1();
		} else {
			await import_all_json_scores_v2();
		}
	}
};