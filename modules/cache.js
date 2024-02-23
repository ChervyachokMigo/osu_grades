const { is_use_caching, cache_expire_time_hours, is_delete_cache } = require('../data/config');
const { cache_path } = require('../misc/const');
const { cache_beatmap_v1_filename } = require('../misc/text_templates');
const { folder_prepare, escape_windows_special_chars, delete_files_in_folder } = require('../tools/misc');

const { existsSync, readFileSync, writeFileSync, readdirSync, lstatSync, rmSync } = require('fs');

const path = require('path');

const cache_beatmaps_v1 = path.join( cache_path, 'beatmaps', 'v1' );

const cache_expire_time_ms = cache_expire_time_hours * 60 * 60 * 1000;

const _this = module.exports = {
	clear_cache: () => {
		delete_files_in_folder(cache_beatmaps_v1);
	},

	check_cache_date: () => {
		if ( is_use_caching == false )
			return;

		readdirSync( cache_beatmaps_v1, {encoding: 'utf8'}).forEach( file => {
			const filetime = (lstatSync( path.join( cache_beatmaps_v1, file ) )).mtime.getTime();
			const now = new Date().getTime();

			if ( now - filetime > cache_expire_time_ms ) {
				console.log( 'cache expired for', file );
				rmSync( path.join( cache_beatmaps_v1, file ) );
			}
		});
	},

	init_cache: () => {
		if (is_use_caching == false){
			return;
		}

		folder_prepare( cache_beatmaps_v1 );

		if (is_delete_cache) _this.check_cache_date();

	},

	/**
	 * Returns request results from cache
	 * @param {*} cache_type 'beatmaps_v1
	 * @param {*} params since_date, limit, gamemode
	 * @returns request results
	 */
	get_cache: ( cache_type, params ) => {
		if (is_use_caching == false)
			return false;

		if (is_delete_cache) _this.check_cache_date();

		if (cache_type === 'beatmaps_v1') {
			const filename = escape_windows_special_chars( cache_beatmap_v1_filename( params ) );
			const request_filepath = path.join( cache_beatmaps_v1, filename );

			if (!existsSync( request_filepath ))
				return false;

			const data = readFileSync( request_filepath ,'utf8' );
			if ( !data )
				return false;

			return JSON.parse( data );
		}
	},

	set_cache: ( cache_type, params, data ) => {
		if (is_use_caching == false)
			return false;

		if (is_delete_cache) _this.check_cache_date();

		if (cache_type === 'beatmaps_v1') {
			const filename = escape_windows_special_chars( cache_beatmap_v1_filename( params) );
			const request_filepath = path.join( cache_beatmaps_v1, filename );

			writeFileSync( request_filepath, JSON.stringify( data ), { encoding: 'utf8' });
		}
	},
};