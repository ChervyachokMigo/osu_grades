const config = require('../modules/config_control.js');

const { cache_path, beatmaps_v1_request_limit, beatmaps_v2_request_limit } = require('../misc/const');
const { cache_beatmap_v1_filename, cache_beatmap_v2_filename } = require('../misc/text_templates');
const { folder_prepare, escape_windows_special_chars, delete_files_in_folder, load_json } = require('../tools/misc');

const { writeFileSync, readdirSync, lstatSync, rmSync } = require('fs');

const path = require('path');

const cache_beatmaps_v1 = path.join( cache_path, 'beatmaps', 'v1' );
const cache_beatmaps_v2 = path.join( cache_path, 'beatmaps', 'v2' );



const check_cache_folder_for_expire_files = ( folder , file ) => {
	const cache_expire_time_hours = config.get_value('cache_expire_time_hours');
	const cache_expire_time_ms = cache_expire_time_hours * 60 * 60 * 1000;
	const filepath = path.join( folder, file );
	const filetime = lstatSync( filepath ).mtime.getTime();
	const now = new Date().getTime();

	if ( now - filetime > cache_expire_time_ms ) {
		console.log( 'cache expired for', filepath );
		rmSync( filepath );
	}
};

const _this = module.exports = {
	clear_cache: () => {
		delete_files_in_folder(cache_beatmaps_v1);
		delete_files_in_folder(cache_beatmaps_v2);
	},

	check_cache_date: () => {
		const is_use_caching = config.get_value('is_use_caching');
		if ( is_use_caching == false )
			return;

		readdirSync( cache_beatmaps_v1, {encoding: 'utf8'}).forEach( file => 
			check_cache_folder_for_expire_files( cache_beatmaps_v1, file ));

		readdirSync( cache_beatmaps_v2, {encoding: 'utf8'}).forEach( file => 
			check_cache_folder_for_expire_files( cache_beatmaps_v2, file ));

	},

	init_cache: () => {
		const is_use_caching = config.get_value('is_use_caching');
		if (is_use_caching == false){
			return;
		}

		console.warn( ' CACHE SWITCHED ON, POSSIBLE REQUEST OLD DATA ^.^ ');

		folder_prepare( cache_beatmaps_v1 );
		folder_prepare( cache_beatmaps_v2 );

		const is_delete_cache = config.get_value('is_delete_cache');
		if (is_delete_cache) _this.check_cache_date();

	},

	/**
	 * Returns request results from cache
	 * @param {*} cache_type 'beatmaps_v1', 'beatmaps_v2'
	 * @param {*} params since_date, limit, gamemode
	 * @param {*} params query, query_strict, ruleset, status, cursor_string, sort
	 * @returns request results
	 */
	get_cache: ( cache_type, params ) => {
		const is_use_caching = config.get_value('is_use_caching');
		if (is_use_caching == false)
			return false;
		
		const is_delete_cache = config.get_value('is_delete_cache');
		if (is_delete_cache) _this.check_cache_date();

		// ========================= BEATMAP V1 =========================
		if (cache_type === 'beatmaps_v1') {
			const filename = escape_windows_special_chars( cache_beatmap_v1_filename( params ) );
			const request_filepath = path.join( cache_beatmaps_v1, filename );

			const data = load_json( request_filepath );
			if ( !data ) return false;

			console.log( 'found cache data, returning', data.length, 'bytes' );
			return data;

		// ========================= BEATMAP V2 =========================
		} else if (cache_type === 'beatmaps_v2') {
			const filename = escape_windows_special_chars( cache_beatmap_v2_filename( params ) );
			const request_filepath = path.join( cache_beatmaps_v2, filename );

			const data = load_json( request_filepath );
			if ( !data ) return false;

			console.log( 'found cache data, returning', data.length, 'bytes' );
			return data;

		}
	},

	set_cache: ( cache_type, params, data ) => {
		const is_use_caching = config.get_value('is_use_caching');
		if (is_use_caching == false)
			return false;

		const is_delete_cache = config.get_value('is_delete_cache');
		if (is_delete_cache) _this.check_cache_date();

		// ========================= BEATMAP V1 =========================
		if (cache_type === 'beatmaps_v1' && data.length === beatmaps_v1_request_limit ) {
			const filename = escape_windows_special_chars( cache_beatmap_v1_filename( params ) );
			const request_filepath = path.join( cache_beatmaps_v1, filename );
			const stringify_data = JSON.stringify( data );
			writeFileSync( request_filepath, stringify_data , { encoding: 'utf8' });

			console.log( 'wrote cache data, saved', stringify_data.length, 'bytes' );
		} else if (cache_type === 'beatmaps_v2' && data.beatmapsets.length === beatmaps_v2_request_limit ) {
			const filename = escape_windows_special_chars( cache_beatmap_v2_filename( params ) );
			const request_filepath = path.join( cache_beatmaps_v2, filename );
			const stringify_data = JSON.stringify( data );
			writeFileSync( request_filepath, stringify_data , { encoding: 'utf8' });

			console.log( 'wrote cache data, saved', stringify_data.length, 'bytes' );
		}
	},
};