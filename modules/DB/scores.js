const { Op } = require('@sequelize/core');
const { select_mysql_model } = require('MYSQL-tools');

const { RankedStatus } = require('osu-tools');
const { group_by } = require('../../tools/misc');
const { rank_to_int } = require('../../misc/const');
const users = require('./users');
const config = require('../../modules/config_control.js');

const select_score_mode_model = ( score_mode ) => {
	const model = {
		'1': select_mysql_model('osu_score_legacy'),
		'2': select_mysql_model('osu_score'),
	};

	if (Object.keys(model).indexOf(score_mode.toString()) === -1){
		throw new Error('invalid score_mode', score_mode);
	}

	return model[score_mode];
};

module.exports = {
	count_scores_by_gamemode: async ({ userid, gamemode = -1, score_mode = 2 }) => {
		const is_loved_select = config.get_value('is_loved_select');
		
		const where_scores = { userid, best: true };

		const ranked_statuses = [ RankedStatus.ranked, RankedStatus.approved ];
		const statuses = is_loved_select ?  [ ...ranked_statuses, RankedStatus.loved  ]: ranked_statuses;

		const where_beatmaps = { ranked: { [Op.in]: statuses } };
		
		if ( gamemode >= 0 && gamemode <= 3 ){
			where_scores.gamemode = gamemode;
			where_beatmaps.gamemode = gamemode;
		}

		const score_mode_model = select_score_mode_model( score_mode );
		
		const scores = await score_mode_model.findAll({ where: where_scores, raw: true, attributes: ['md5', 'gamemode'] });
		const scores_gamemodes = Object.entries(group_by(scores, 'gamemode'));

		const osu_beatmap_id = select_mysql_model('beatmap_id');
		const beatmaps = await osu_beatmap_id.findAll({ where: where_beatmaps, raw: true, attributes: ['md5', 'gamemode'] });
		const beatmaps_gamemodes = Object.entries(group_by(beatmaps,'gamemode'));
		const beatmaps_count = beatmaps_gamemodes.map( ([m, s]) => ({ gamemode: m, count: s.length }));
		
		const count_scores = scores_gamemodes.map( ([m, s]) => 
			({ 	gamemode: m, 
				count: s.length, 
				beatmaps_count: beatmaps_count.find( x => x.gamemode === m ).count }));
		
		return count_scores;

	},

	update_grades: async ({ userid, gamemode, score_mode }) => {
		console.log( 'update_grades', score_mode, userid, gamemode );

		const score_mode_model = select_score_mode_model( score_mode );

		const where = { userid, gamemode };

		if (score_mode == 2) {
			where.ranked = true;
		}

		const where_count = {
			...where,
			best: true,
		};

		const scores = await score_mode_model.findAll({ raw: true, 
			attributes: ['id', 'total_score', 'rank', 'best', 'beatmap_id'], 
			where });

		const grouped_scores = group_by( scores, 'beatmap_id' );
		
		const scores_arr = Object.entries(grouped_scores);

		const scores_to_update = [];

		// eslint-disable-next-line no-unused-vars
		scores_arr.forEach( ([beatmap_id, scores]) => {
			scores.sort( (a, b) => b.total_score - a.total_score );
			scores.forEach( (score, i) => {
				const old_best = score.best;
				score.best = (i == 0) ? true : false;
				if (old_best != score.best) {
					scores_to_update.push({ id: score.id, best: score.best });
				}
			});
		});

		console.log('scores to update:', scores_to_update.length);
		let count = 0;
		console.time('updating for');
		for (let score of scores_to_update) {
			await score_mode_model.update( 
				score, { fields: ['best'], where: { id: score.id }} );
			count++;
		}
		console.log( `updated ${count} scores` );
		console.timeEnd('updating for');
	
		let grades = {};
		for ( let [rank_char, rank_int] of Object.entries(rank_to_int)) {
			where_count.rank = rank_int;
			const res = await score_mode_model.findAndCountAll({ 
				raw: true, attributes: ['rank'], where: where_count });
			const count = res?.count || 0;
			grades = {...grades, [rank_char]: count };
		}

		await users.update_grades ({ userid, gamemode, score_mode }, grades);

	},
};