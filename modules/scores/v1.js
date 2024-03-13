const { ModsIntToShortText, scores_db_load,
	all_score_properties, scores_db_save, ModsShortTextToInt } = require('osu-tools');
const path = require('path');

const { osu_score_legacy, beatmaps_md5 } = require('../DB/defines');
const { Num, boolean_from_string, group_by } = require('../../tools/misc');
const { get_md5_id, mods_v2_to_string } = require('../DB/tools');

const { rank_to_int } = require('../../misc/const');
const { osu_path } = require('../../data/config');
const { request_user_info } = require('../osu_requests_v1');
const { copyFileSync, rmSync } = require('fs');

const convert_v2_to_v1 = async ({ score, beatmap }) => ({
	score: {
		score_id: BigInt(score.legacy_score_id),
		user_id: Num(score.user_id),
		rank: score.rank,
		date: score.ended_at,
		score: Num(score.legacy_total_score),
		maxcombo: Num(score.max_combo),
		pp: Num(score.pp),
		mods: mods_v2_to_string( score.mods ),
		count50: Num(score.statistics?.meh),
		count100: Num(score.statistics?.ok),
		count300: Num(score.statistics?.great),
		countkatu: 0,
		countgeki: 0,
		countmiss: Num(score.statistics?.miss),
		perfect: score.legacy_perfect
	},
	beatmap,
});

const score_v1_parse = async ({ beatmap, score }) => {
	if (!beatmap || !beatmap.md5){
		console.log({ beatmap, score });
		throw new Error('no beatmap');
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
		count_50: Num(score.count50),
		count_100: Num(score.count100),
		count_300:  Num(score.count300),
		count_katu: Num(score.countkatu),
		count_geki: Num(score.countgeki),
		count_miss: Num(score.countmiss),
		is_fc: boolean_from_string(score.perfect)
	};};


// v1
/**
 * @param beatmap
 * @param score
 */
const save_scores_v1 = async ( data_arr ) => {
	const scores = ( await Promise.all( 
		data_arr.filter( x => x && x.score && x.beatmap ).map( async x => await score_v1_parse( x )))
	);
	const res = await osu_score_legacy.bulkCreate( scores, { ignoreDuplicates: true });
	return res.length;
};

const _this = module.exports = {
	convert_v2_to_v1,
	score_v1_parse,
	save_scores_v1,
	convert_v1_to_osu: (username, beatmap_md5, score) => ({
		gamemode_int: score.gamemode,
		score_version: Number(score.date.slice(0, 10).replace(/[-]+/gui, '')),
		beatmap_md5,
		playername: username,
		replay_md5: '',
		count_300: score.count_300,
		count_100: score.count_100,
		count_50: score.count_50,
		count_geki: score.count_geki,
		count_katu: score.count_katu,
		count_miss: score.count_miss,
		scores: score.total_score,
		combo: score.max_combo,
		is_fc: score.is_fc,
		mods_int: ModsShortTextToInt( score.mods.split('+') ),
		windows_tick_date: (BigInt(new Date(score.date).getTime()) + BigInt(62135596800000)) * BigInt(10000),
		online_id: BigInt(score.id)
	}),

	update_osu_scores_db: async ({ userid }) => {
		const old_scores_path = path.join( osu_path , 'scores.db' );
		const temp_scores_path = path.join( osu_path, 'temp_scores.db' );

		const backup_name = 'scores-' + 
			new Date().toISOString().replace(/[T.:]+/gui, '-').replace('Z', '') + 
			'.db.bak';
		const backup_path = path.join( osu_path, backup_name );

		const scores_osu = scores_db_load(path.join(osu_path, 'scores.db'), all_score_properties);
		const scores_db = await osu_score_legacy.findAll({ 
			raw: true, 
			include: [ { model: beatmaps_md5 } ],

			fieldMap: {
				'beatmaps_md5.id': 'md5',
				'beatmaps_md5.hash': 'hash',
			},

			where: { userid },
		});

		const osu_user = await request_user_info({ userid });
		if (!osu_user) return;
		const username = osu_user.username;

		const groupped_scores = Object.entries( group_by( scores_db, 'hash' ));

		groupped_scores.forEach( ([beatmap_md5, scores]) => {
			const i = scores_osu.beatmaps_scores.findIndex( x => x.beatmap_md5 === beatmap_md5 );
			if ( i > -1) {
				for (let score of scores) {
					if ( score.id ) {
						if (scores_osu.beatmaps_scores[i].scores.findIndex( x => 
							x.online_id === BigInt(score.id) ) === -1) {

							scores_osu.beatmaps_scores[i].scores.push( _this.convert_v1_to_osu(username, beatmap_md5, score) );
						
						}
					}
				}
			} else {
				const converted_scores = scores.map ( score => _this.convert_v1_to_osu(username, beatmap_md5, score));
				scores_osu.beatmaps_scores.push({ beatmap_md5, scores: converted_scores });
			}
		});

		copyFileSync( old_scores_path, backup_path  );
		scores_db_save( scores_osu, temp_scores_path );

		copyFileSync ( temp_scores_path, old_scores_path );
		rmSync( temp_scores_path, { force: true } );
		
		console.log( 'scores saved' );
	}
};