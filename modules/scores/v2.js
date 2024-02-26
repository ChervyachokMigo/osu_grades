
const { osu_score } = require('../DB/defines');
const { Num, group_by } = require('../../tools/misc');
const { get_md5_id, mods_v2_to_string } = require('../DB/tools');

const { rank_to_int } = require('../../misc/const');
const { update_grades } = require('../DB/users');

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
		const res = await osu_score.upsert( score, { raw: true });
		return res.pop();
	},
	// Multiple scores
	save_scores_v2: async ( data_arr ) => {
		const scores = await Promise.all( 
			data_arr.filter( x => x && x.id ).map ( async x => await _this.convert_v2_to_db( x ))
		);
        
		const res = await osu_score.bulkCreate( scores, { ignoreDuplicates: true });
		return res.length;
	},
	
	update_grades_v2: async ({ userid, gamemode }) => {
		console.log( 'count_grades_v2', userid, gamemode );

		const scores = await osu_score.findAll({ raw: true, 
			attributes: ['id', 'total_score', 'rank', 'best', 'beatmap_id',], 
			where: { userid, gamemode, ranked: true }});

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
			await osu_score.update( score, { fields: ['best'], where: { id: score.id }} );
			count++;
		}
		console.log( `updated ${count} scores` );
		console.timeEnd('updating for');
	
		let grades = {};
		for ( let rank of Object.entries(rank_to_int)) {
			const res = await osu_score.findAndCountAll({ raw: true, attributes: ['rank'], where: { userid, gamemode, 
				ranked: true, rank: rank[1], best: true }});
			const count = res?.count || 0;
			grades = {...grades, [rank[0]]: count };
		}

		await update_grades ({ userid, gamemode, score_mode: 2 }, grades);

		//console.log('test', grades )
	},
};