const { ModsIntToShortText, scores_db_load,
	all_score_properties, scores_db_save, ModsShortTextToInt } = require('osu-tools');
const path = require('path');
const { select_mysql_model } = require('mysql-tools');

const { Num, boolean_from_string, group_by, concat_array_of_arrays, print_processed } = require('../../tools/misc');
const { get_md5_id, mods_v2_to_string } = require('../DB/tools');

const { rank_to_int } = require('../../misc/const');
const { copyFileSync, renameSync } = require('fs');
const config = require('../../modules/config_control.js');


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
	const osu_score_legacy = select_mysql_model('osu_score_legacy');
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

	update_osu_scores_db: async ( users ) => {

		if (!users.length || users.length == 0){
			console.error('update_osu_scores_db', 'No users');
			return;
		}

		const osu_path = config.get_value('osu_path');
		
		const old_scores_path = path.join( osu_path , 'scores.db' );
		const temp_scores_path = path.join( osu_path, 'temp_scores.db' );

		const backup_name = 'scores-' + 
			new Date().toISOString().replace(/[T.:]+/gui, '-').replace('Z', '') + 
			'.db.bak';
		const backup_path = path.join( osu_path, backup_name );

		const scores_osu = scores_db_load(path.join(osu_path, 'scores.db'), all_score_properties);
		const beatmaps_md5 = select_mysql_model('beatmaps_md5');
		const osu_score_legacy = select_mysql_model('osu_score_legacy');

		for (let {userid, username, gamemode} of users) {
			const new_scores = await osu_score_legacy.findAll({ 
				raw: true, 
				include: [ { model: beatmaps_md5 } ],

				fieldMap: {
					'beatmaps_md5.id': 'md5',
					'beatmaps_md5.hash': 'hash',
				},

				where: { userid, gamemode },
			});
			
			const beatmaps_scores_exists = new Set(scores_osu.beatmaps_scores.map( x => x.beatmap_md5 ));
			const scores_ids_exists = new Set( concat_array_of_arrays(
				scores_osu.beatmaps_scores.map( x => x.scores.map( y => y.online_id.toString() ))));
		
			let count = 0;

			for (let [beatmap_md5, scores] of Object.entries( group_by( new_scores, 'hash' ))) {

				if ( !beatmaps_scores_exists.has( beatmap_md5 )) {
					const converted_scores = scores.map ( 
						score => _this.convert_v1_to_osu(username, beatmap_md5, score));
					scores_osu.beatmaps_scores.push({ beatmap_md5, scores: converted_scores });
				} else {
					const new_scores = scores.filter( score => !scores_ids_exists.has(score.id) )
						.map( score =>  _this.convert_v1_to_osu(username, beatmap_md5, score));
					const i = scores_osu.beatmaps_scores.findIndex( x => x.beatmap_md5 === beatmap_md5 );
					scores_osu.beatmaps_scores[i].scores.push( ...new_scores );
				}
			
				print_processed({ current: count, size: new_scores.length, name: 'scores' });
				count++;
			}
		}

		scores_osu.beatmaps_scores.forEach( x => x.scores.sort(( a, b ) => b.scores  - a.scores ));
	
		console.log( 'make backup:', backup_path );
		copyFileSync( old_scores_path, backup_path );
		console.log( 'saving scores...');
		console.time( 'saving scores');
		scores_db_save( scores_osu, temp_scores_path );
		console.timeEnd('saving scores');
		renameSync( temp_scores_path, old_scores_path );
		
		console.log( 'scores saved' );
	}
};