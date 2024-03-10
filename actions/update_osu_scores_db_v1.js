const { check_userid } = require('../tools/misc');
const { update_osu_scores_db } = require('../modules/scores/v1');

module.exports = {
	args: ['userid'],
	action: async( args ) => {
		console.log('update_osu_scores_db_v1');
		const userid = check_userid( args.userid );
		if (!userid) return;

		await update_osu_scores_db({ userid });
	}};