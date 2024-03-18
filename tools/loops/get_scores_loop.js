const { writeFileSync } = require('fs');

const { RankedStatus } = require('osu-tools');

const osu_auth = require('../osu_auth');
const find_beatmaps = require('../find_beatmaps');
const { check_gamemode, print_processed, check_userid, folder_prepare, load_json } = require('../misc');
const { get_scores_load_filename } = require('../../misc/text_templates');
const { load_path } = require('../../misc/const');
const path = require('path');
const { Op } = require('@sequelize/core');

module.exports = async({ args, score_mode, ranked_status = RankedStatus.ranked, init = async () => {}, callback }) => {
	//check userid
	const userid = check_userid( args.userid );
	if (!userid) return;

	//check gamemode
	const ruleset = check_gamemode( args.gamemode );

	//check continue
	let continue_md5 = args.continue_md5 || null;
	const load_filename = path.join( load_path, get_scores_load_filename({ userid, score_mode, ruleset, ranked_status }));
	folder_prepare( load_path );
	if ( continue_md5 && continue_md5.length !==32 ){
		if ( continue_md5 === 'load' ) {
			const data = load_json( load_filename );
			if (data && data?.continue_md5){
				continue_md5 = data.continue_md5;
			} else {
				continue_md5 = null;
			}
		} else {
			console.error( '[continue_md5] > wrong md5 hash' );
			return;
		}
	}
	let is_continue = continue_md5 ? true : false;

	await init( userid );

	// ranked + approved
	const ranked_where = ranked_status == RankedStatus.ranked ? { [Op.in]: [ RankedStatus.ranked, RankedStatus.approved ] } : ranked_status;
	//load beatmaps from DB
	const beatmaps_db = ( await find_beatmaps({ ranked: ranked_where, gamemode: ruleset.idx }))
		.filter( x => x.beatmap_id > 0 );
	console.log( 'founded', beatmaps_db.length, 'ranked beatmaps' );

	if ( score_mode > 1 ){
		console.log( 'authing to osu' );
		await osu_auth();
	}

	//start process
	console.log( 'starting to send requests' );
	let i = -1;
	for ( let beatmap of beatmaps_db ){
		i++;
		print_processed({ current: i, size: beatmaps_db.length, frequency: Math.trunc(beatmaps_db.length / 50), name: 'beatmaps' });

		//go to md5 and continue
		if (is_continue){
			if ( beatmap.md5 === continue_md5 ) {
				console.log( 'continue from', continue_md5 );
				print_processed({ current: i, size: beatmaps_db.length, frequency: beatmaps_db.length / 10000, name: 'beatmaps', force: true });
				is_continue = false;
			} else {
				continue;
			}
		}

		//skip gamemodes if setted game mode 0 - 3
		if ( ruleset.idx >= 0 && beatmap.gamemode !== ruleset.idx ){
			continue;
		}

		if ( await callback( beatmap, userid ) && continue_md5 !== beatmap.md5 ){
			writeFileSync( load_filename, JSON.stringify({ continue_md5: beatmap.md5 }), 'utf8' );			
		}

	}
};
