const { writeFileSync, fstat, readFileSync } = require('fs');

const { RankedStatus } = require('osu-tools');

const { osu_auth, get_token } = require('../osu_auth');
const find_beatmaps = require('../find_beatmaps');
const { check_gamemode, print_processed, check_userid, folder_prepare, load_json, concat_array_of_arrays } = require('../misc');
const { get_scores_load_filename } = require('../../misc/text_templates');
const { load_path } = require('../../misc/const');
const path = require('path');
const { Op } = require('@sequelize/core');

const config = require('../../modules/config_control.js');

const async_start = require('async-calculations');
const { save_scores_v1 } = require('../../modules/scores/v1');
const { save_scores_v2 } = require('../../modules/scores/v2');

/**
 * args: userid, gamemode, continue_md5, beatmaps_mode, beatmapsets
 */
const _this = module.exports = async({ args, score_mode, init = async () => {} }) => {

	if (score_mode !== 1 && score_mode !== 2) {
		console.error( '[score_mode] > unsupported score mode' );
        return;
	}

	//check userid
	const userid = check_userid( args.userid );
	if (!userid) return;

	//check gamemode
	const ruleset = check_gamemode( args.gamemode );

	const beatmaps_mode = args.beatmaps_mode || 'local';

	//check continue
	let continue_md5 = args.continue_md5 || null;
	const load_filename = path.join( load_path, get_scores_load_filename({ userid, score_mode, ruleset }));

	folder_prepare( load_path );
	if ( continue_md5 && continue_md5.length !==32 ){
		if ( continue_md5 === 'load' || continue_md5 === 'true' || continue_md5 === '1') {
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

	const is_loved_select = config.get_value('is_loved_select');
	// ranked + approved + ?loved
	const ranked_statuses = [ RankedStatus.ranked, RankedStatus.approved ];
	const ranked_where = { [Op.in]: is_loved_select ?  [ ...ranked_statuses, RankedStatus.loved ]: ranked_statuses };

	//load beatmaps from DB
	const beatmaps_list = 
		(beatmaps_mode === 'local') ?
			(await find_beatmaps({ ranked: ranked_where, gamemode: ruleset.idx }))
				.filter( x => x.beatmap_id > 0 )
				.filter( beatmap => beatmap.gamemode === ruleset.idx ) :
		(beatmaps_mode === 'list') ?
			args.beatmapsets || []
		: [];
		
	//console.log( 'prepared', beatmaps_list.length, 'beatmaps' );
	//console.log(beatmaps_list);

	if ( score_mode > 1 ){
		//console.log( 'authing to osu' );
		await osu_auth();
	}

	//start process
	//console.log( 'starting to send requests' );

	let i = 0;
	const chunk_size = 102;
	const workers_length = 6;

	let result = [];

	while(true) {
		
		const data_chunk = beatmaps_list.slice(i, i + chunk_size);

		if (data_chunk.length === 0) {
			//console.log( 'No more beatmaps to process' );
			break;
		}

		//console.log(data_chunk[0].md5)

		/*if (is_continue) {
			
			if ( data_chunk.findIndex( x => x.md5 === continue_md5 ) === -1 ){
				i += chunk_size;
				//console.log('i', i)
				continue;
			} else {
				console.log( 'continue from', continue_md5 );
				print_processed({ 
					current: i, 
					size: beatmaps_list.length,
					name: 'beatmaps', 
					force: true 
				});
				is_continue = false;
			}
		} else {
			print_processed({ 
				current: i,
				size: beatmaps_list.length, 
				frequency: beatmaps_list.length, 
				name: 'beatmaps' 
			});
		}*/

		

		//const time_start = new Date().valueOf();

		const procedure_filename = score_mode === 1 ? 'get_score_v1_async.js' : score_mode === 2 ? 'get_score_v2_async.js' : '';

		const data_out = await async_start({
			max: workers_length,
			data: data_chunk,
			//proxy_list: proxy_list,
			procedure_path: path.join(__dirname, 'async_procedures', procedure_filename),
			procedure_data: { userid: userid, v2_token: get_token() },
			IS_STDOUT: false,
			IS_DEBUG: false
		});

		/*const time_end = new Date().valueOf();

		const time_diff = time_end - time_start;
		const avg_per_map = time_diff / chunk_size;

		const time_left = (avg_per_map * (beatmaps_list.length - i)) / 1000 / 60;
		process.stdout.write(`                                                                                \r`);
		process.stdout.cursorTo(43)
		process.stdout.write(`Time left ${time_left.toFixed(1)} minutes\r`);*/


		const data_to_save = concat_array_of_arrays( data_out.filter( x => x.data_out !== null ).map( x => x.data_out ));
		
		if (beatmaps_mode === 'local') {
			if (score_mode === 1) {
				await save_scores_v1( data_to_save );
			} else if (score_mode === 2) {
				await save_scores_v2( data_to_save );
			}
			try {
				const lastElement = data_to_save.slice(-1)[0];
				if (lastElement){
					if (score_mode === 1){
						const last_beatmap_md5 = lastElement.beatmap.md5;
						if(continue_md5 !== last_beatmap_md5) {
							//console.log('saving continue_md5:', continue_md5 );
							writeFileSync( load_filename, JSON.stringify({ continue_md5: last_beatmap_md5 }), 'utf8' );	
						}
					} else if (score_mode === 2) {
						const last_beatmap_md5 = lastElement.beatmap_md5;
						if(continue_md5 !== last_beatmap_md5) {
							//console.log('saving continue_md5:', continue_md5 );
							writeFileSync( load_filename, JSON.stringify({ continue_md5: last_beatmap_md5 }), 'utf8' );	
						}
					}
				}
			} catch (e) {
				console.error( 'Error saving continue_md5:', e );
			}
		} else if (beatmaps_mode === 'list') {
			result = result.concat(data_to_save);
		}


		i += chunk_size;
	}

	return result;

};
