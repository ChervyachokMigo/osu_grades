const { Op } = require('@sequelize/core');
const { osu_score, osu_beatmap_id, osu_score_legacy } = require('./defines');
const { RankedStatus } = require('osu-tools');
const { group_by } = require('../../tools/misc');

module.exports = {
	count_scores_by_gamemode: async ({ userid, gamemode = -1, score_mode = 2 }) => {

		const where_scores = { userid, best: true };
		const where_beatmaps = { ranked: { [Op.in]: [ RankedStatus.ranked, RankedStatus.approved ] } };
		
		if ( gamemode >= 0 && gamemode <= 3 ){
			where_scores.gamemode = gamemode;
			where_beatmaps.gamemode = gamemode;
		}

		if (score_mode === 1) {
			const scores = await osu_score_legacy.findAll({ where: where_scores, raw: true, attributes: ['md5', 'gamemode'] });
			const scores_gamemodes = Object.entries(group_by(scores, 'gamemode'));

			const beatmaps = await osu_beatmap_id.findAll({ where: where_beatmaps, raw: true, attributes: ['md5', 'gamemode'] });
			const beatmaps_gamemodes = Object.entries(group_by(beatmaps,'gamemode'));
			const beatmaps_count = beatmaps_gamemodes.map( ([m, s]) => ({ gamemode: m, count: s.length }));
			
			const count_scores = scores_gamemodes.map( ([m, s]) => 
				({ 	gamemode: m, 
					count: s.length, 
					beatmaps_count: beatmaps_count.find( x => x.gamemode === m ).count }));
			
			return count_scores;

		} else if (score_mode === 2) {
			const scores = await osu_score.findAll({ where: where_scores, raw: true, attributes: ['md5', 'gamemode'] });
			const scores_gamemodes = Object.entries(group_by(scores, 'gamemode'));

			const beatmaps = await osu_beatmap_id.findAll({ where: where_beatmaps, raw: true, attributes: ['md5', 'gamemode'] });
			const beatmaps_gamemodes = Object.entries(group_by(beatmaps,'gamemode'));
			const beatmaps_count = beatmaps_gamemodes.map( ([m, s]) => ({ gamemode: m, count: s.length }));
			
			const count_scores = scores_gamemodes.map( ([m, s]) => 
				({ 	gamemode: m, 
					count: s.length, 
					beatmaps_count: beatmaps_count.find( x => x.gamemode === m ).count }));
			
			return count_scores;

		}
	}
};