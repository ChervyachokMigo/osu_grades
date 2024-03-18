const { writeFileSync } = require('fs');

const default_config = require('../misc/config-sample.js');
const { config_path } = require('../misc/const');
const { load_json } = require('../tools/misc');

const config_keys = Object.keys(default_config);

const _this = module.exports = {
	init: () => {
		_this.data = load_json( config_path );
		if (!_this.data) {
			_this.data = _this.save ( default_config );
		}
		return _this.data;
	},

	reset: () => {
		_this.data = _this.save ( default_config );
	},

	get_value: ( key ) => {
		const value = _this.data[ key ];
		const default_value = default_config[ key ];
		if (key === 'api_version' && !(value >= 1 && value <= 3) ) {
			return default_value;
		}
		
		return value;
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
};