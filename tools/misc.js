const { existsSync, mkdirSync, readdirSync, unlinkSync, readFileSync } = require('fs');

const { gamemode, print_progress_frequency, beatmap_status_to_db, beatmap_status_from_db } = require('../misc/const');
const path = require('path');

const _this = module.exports = {
	folder_prepare: ( path ) =>{
		try{
			if ( !existsSync( path )) 
				mkdirSync( path, { recursive: true }); 
			return true;
		} catch (e) {
			console.error( 'Cannot create folder:', path );
			console.error(e);
			return false;
		}
	},

	get_ruleset_by_gamemode_int: ( val ) => {
		const idx = isNaN( Number(val)) ? -1 : Number(val);

		return { 
			name: (idx >= 0 && idx <=3) ? gamemode[idx] : 'all', 
			idx,
		};
	},

	check_gamemode: ( val ) => {
		const idx = typeof val === 'undefined' ? -2 : 
			( isNaN( Number(val) ) || val < -1 || val > 3 ) ? -2 : 
				Number(val);

		if ( idx >= 0 && idx <= 3 ){
			return { 
				name: gamemode[idx], 
				idx,
			};

		} else if (idx == -1) {

			console.log('gamemode: all');
			return { 
				name: null, 
				idx: -1
			};

			// if (idx == -2) by default
		} else {
			console.log('gamemode: every');
			return { 
				name: null, 
				idx,
			};
		}
	},

	is_gamemode: (idx) => idx >= 0 && idx <=3,

	check_score_mode: ( val ) => {
		const res = _this.Num( val, 2 );
		if (!res || isNaN(res) || res < 1 || res > 3 ){
			console.error( 'score mode invalid:', val );
			return null;
		}
		return res;
	},

	print_processed: ({ current, size, initial = 0, 
		frequency = print_progress_frequency, force = false, name, percent_precition = 2, show_percent = true, show_values = true, multiplier = 1 }) => {
        
		const spaceAfter = ( v ) => v ? v + ' ' : '';

		const print_current = initial == 0 ? Number(current) + 1 : current;
		const percent = Math.trunc( (1 / frequency) * size) || 1;
		
		if ( force || print_current % percent == 0 || current == initial || print_current == size ) {
			let percent_text = show_percent ? (( current == initial ? 0 : print_current ) / size * 100 ).toFixed(percent_precition) + '%' : '';
			let value_text = show_values ? `(${print_current * multiplier}/${size * multiplier})` : '';
			console.log( 'processed ' + spaceAfter(name) + spaceAfter(percent_text) + value_text );
		}
	},

	check_userid: ( val ) => {
		const userid = Number(val) || null;
		if ( !userid || isNaN( userid ) || userid == 0 ){
			console.error( 'userid invalid:', userid );
			return null;
		}
		return userid;
	},

	Num: ( x, default_value = 0 ) => !isNaN( Number(x) ) ? Number(x) : default_value,

	import_beatmap_status: ( status ) => {
		return beatmap_status_to_db[status] ?? 0; // unknown
	},

	export_beatmap_status: ( status ) => {
		return beatmap_status_from_db[status] ?? 0;
	},

	util: (...args) => {
		console.log( require('util').inspect( args, {showHidden: true, depth: null, colors: false }) );
	},
	group_by(array, property) {
		return array.reduce((memo, x) => {
			memo[x[property]] ||= [];
			memo[x[property]].push(x);
			return memo;
		}, {});
	},

	concat_array_of_arrays: ( arr ) => [].concat(...arr),

	split_array_on_chunks: ( arr, len = null ) => {
		if (typeof len === 'undefined' || len === null || len === 0) {
			return arr;
		}

		if (typeof arr !== 'object'){
			throw new Error('split_array > array is not the object');
		}

		let chunks = [];
		let i = 0;

		while (i < arr.length) {
			chunks.push(arr.slice(i, i += len));
		}

		return chunks;
	},

	boolean_from_string: ( val ) => {
		return !(typeof val === 'boolean') ?
			val === 'true' || val === '1' || val === 1 ? true : false : 	// not a boolean
			val;	//is boolean
	},

	escape_windows_special_chars( input ) {
		// eslint-disable-next-line no-control-regex
		const special_chars = /[\x00-\x1f\\:*?"<>|]/g;

		return input.replace( special_chars, '_' );
	},

	delete_files_in_folder: (folder_path) => {
		try {
			const files = readdirSync(folder_path);

			files.for_each(file => {
				const file_path = path.join(folder_path, file);
				unlinkSync(file_path);
			});
		} catch ( err ) {
			console.error( 'error deleting files:', err );
		}
	},

	isJSON: ( str ) => {
		try { 
			JSON.parse( str.toString() );
		} catch (e) { 
			return false; 
		}
		return true;
	},

	load_json: ( filepath, default_value = null ) => {
		if (existsSync( filepath )){
			const data = readFileSync( filepath, 'utf8' );
			if ( _this.isJSON( data )){
				return JSON.parse( data );
			}
		} 

		return default_value;
	},

	get_key_by_value: ( obj, value ) => Object.keys(obj).find(key => obj[key] === value),

	get_objects_attributes: ( obj_arr = [], attributes = [] ) => obj_arr.map( x => 
		Object.fromEntries( Object.entries(x)
			// eslint-disable-next-line no-unused-vars
			.filter(([ key, value ]) => attributes.includes(key) ))),
};