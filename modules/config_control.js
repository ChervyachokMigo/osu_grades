const { writeFileSync } = require('fs');
const input = require('input');


const default_config = require('../misc/config-sample.js');
const { config_path } = require('../misc/const');
const { load_json, boolean_from_string, Num, folder_prepare } = require('../tools/misc');

const config_keys = Object.keys(default_config);

const _this = module.exports = {
	init: () => {
		folder_prepare('data');
		_this.data = load_json( config_path );
		if (!_this.data) {
			_this.data = _this.save( default_config );
		}
		return _this.data;
	},

	reset: () => {
		_this.data = _this.save( default_config );
	},

	get_value: ( key ) => {
		const value = _this.data[ key ];
		const default_value = default_config[ key ];
		if (key === 'api_version' && !(value >= 1 && value <= 3) ) {
			return default_value;
		}
		
		return value;
	},

	get_data: () => {
		if (!_this.data) {
			return _this.init();
		}
		return _this.data;
	},

	set_value: ( key, value ) => {
		if (key && config_keys.indexOf(key) > -1 && value !== null && value !== _this.data[ key ]) {
			_this.data[ key ] = value;
			_this.save();
		}
	},

	save: ( data = _this.data ) => {
		writeFileSync( config_path, JSON.stringify( data ), 'utf8' );
		return data;
	},

	edit: async () => {
		// eslint-disable-next-line no-constant-condition
		while (true){
			const selected_option = await input.select( [
				{ name: 'DB HOST', value: 'DB_HOST' },
				{ name: 'DB PORT', value:'DB_PORT' },
				{ name: 'DB USER', value: 'DB_USER' }, 
				{ name: 'DB PASSWORD', value: 'DB_PASSWORD' }, 
				{ name: 'DB NAME "BEATMAPS"', value: 'DB_NAME_BEATMAPS' }, 
				{ name: 'DB NAME "SCORES"', value: 'DB_NAME_SCORES' }, 
				{ name: 'API key v1 (legacy)', value: 'api_key' }, 
				{ name: 'API v2 APP ID', value: 'api_v2_app_id' }, 
				{ name: 'API v2 APP KEY', value: 'api_v2_app_key' }, 
				{ name: 'Osu path', value: 'osu_path' }, 
				{ name: 'Backup instead remove', value: 'backup_instead_remove' }, 
				{ name: 'Print progress import jsons frequency', 
					value: 'print_progress_import_jsons_frequency' }, 
				{ name: 'Is use caching', value: 'is_use_caching' }, 
				{ name: 'Is delete cache', value: 'is_delete_cache' },
				{ name: 'Cache expire time (hours)', value: 'cache_expire_time_hours' }, 
				{ name: 'Is loved select', value: 'is_loved_select' },
                
				{ name: 'Exit', value: -1 }
			] );

			if (selected_option === -1) {
				break;
			} else {
				console.log('_this.data', _this.data);
				const default_value = {default: _this.data[selected_option]};
				_this.data[selected_option] = _this.data[selected_option] ? 
					await input.text(selected_option, default_value):
					await input.text(selected_option);
				const numbers = ['print_progress_import_jsons_frequency', 'cache_expire_time_hours'];
				if (numbers.includes(selected_option)){
					_this.data[selected_option] = Num(_this.data[selected_option], default_config[selected_option]);
				}
				const booleans = ['backup_instead_remove', 'is_use_caching', 'is_delete_cache', 'is_loved_select'];
				if (booleans.includes(selected_option)){
					_this.data[selected_option] = boolean_from_string(
						_this.data[selected_option], default_config[selected_option]);
				}
				_this.save();
			}
		}
	},
};