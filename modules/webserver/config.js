const { writeFileSync } = require('fs');
const input = require('input');

const default_webconfig = require('../../misc/default_webconfig');
const { webserver_config_path } = require('../../misc/const');
const { Num, load_json } = require('../../tools/misc');
const { findAll } = require('../DB/users');
const { Op } = require('@sequelize/core');

const config_keys = Object.keys(default_webconfig);

const _this = module.exports = {
	init: () => {
		_this.data = load_json( webserver_config_path );
		if (!_this.data) {
			_this.data = _this.save ( default_webconfig );
		}
		return _this.data;
	},

	reset: () => {
		_this.data = _this.save ( default_webconfig );
	},

	get_value: ( key ) => {
		return _this.data[ key ];
	},

	set_value: ( key, value ) => {
		if (key && config_keys.indexOf(key) > -1 && value !== null && value !== _this.data[ key ]) {
			_this.data[ key ] = value;
			_this.save();
		}
	},

	save: ( data = _this.data ) => {
		writeFileSync( webserver_config_path, JSON.stringify( data ), 'utf8' );
		return data;
	},

	edit: async () => {
		// eslint-disable-next-line no-constant-condition
		while (true){
			const selected_option = await input.select( [
				{ name: 'HTTP port', value: 'http_port' },
				{ name: 'Socket port', value:'socket_port' },
				{ name: 'Autoupdate', value: 'autoupdate' }, 
				{ name: 'User', value: 'user' }, 
				{ name: 'Gamemode', value: 'gamemode' }, 
				{ name: 'Score Mode', value: 'score_mode' }, 
				{ name: 'Sort method', value:'sort_method' },
				{ name: 'Exit', value: -1 }
			] );
			
			if (selected_option === -1) {
				break;
			} else if (selected_option === 'http_port') {
				const new_value = Num(await input.text( 
					'Enter http port', 
					{ default: _this.data.GRADES_HTTP_PORT} ), 
				_this.data.GRADES_HTTP_PORT);
				_this.set_value( 'GRADES_HTTP_PORT', new_value );
			} else if (selected_option === 'socket_port') {
				const new_value = Num(await input.text( 
					'Enter socket port', 
					{ default: _this.data.GRADES_SOCKET_PORT} ), 
				_this.data.GRADES_SOCKET_PORT);
				_this.set_value( 'GRADES_SOCKET_PORT', new_value );
			} else if (selected_option === 'autoupdate') {
				const new_value = await input.select([
					{ name: 'Autoupdate: on', value: true},
					{ name: 'Autoupdate: off', value: false}
				]);
				_this.set_value( 'is_web_autoupdating', new_value );
				if (new_value === true) {
					let new_value_time = Num(await input.text( 'Enter autoupdate time in seconds', { default: default_webconfig.web_autoupdate_time_sec}  ),
						default_webconfig.web_autoupdate_time_sec);
					new_value_time = new_value_time < 5 ? 5 : new_value_time;
					_this.set_value( 'web_autoupdate_time_sec', new_value_time );
				}
			} else if (selected_option === 'gamemode') {
				const new_value = await input.select([ 
					{ name: 'All', value: -1 },
					{ name: 'osu', value: 0 }, 
					{ name: 'taiko', value: 1 }, 
					{ name: 'fruits', value: 2 }, 
					{ name: 'mania', value: 3 }
				]);
				_this.set_value( 'web_selected_gamemode', new_value );
			} else if (selected_option === 'sort_method') {
				const new_value = await input.select([ 
					{ name: 'From D to SS ranks', value: 'D_SS' },
					{ name: 'From SS to D ranks', value: 'SS_D' }, 
					{ name: 'by count ascending', value: 'count_asc' }, 
					{ name: 'by count descending', value: 'count_desc' }, 
				]);
				_this.set_value( 'sort_method', new_value );
			} else if (selected_option ==='score_mode') {
				const new_value = await input.select([ 
					{ name: 'v1', value: 1 }, 
					{ name: 'v2', value: 2 }, 
				]);
				_this.set_value( 'web_selected_score_mode', new_value );
			} else if (selected_option === 'user') {
				const users = (await findAll({ score_mode: { [Op.or]: [ 1, 2 ] }}))
					.filter(( v, i, a ) => a.findIndex( x => x.userid === v.userid ) === i );

				if ( users.length > 1 ) {
					const new_value = await input.select( users.map( x=> ({ name: x.username, value: x.userid })));
					console.log(`Added user ${new_value} ${users.find( x => x.userid == new_value).username}`);
					_this.set_value( 'web_selected_userid', new_value );
				} else if ( users.length == 1 ) {
					_this.data.web_selected_userid = users[0].userid;
					_this.save();
					console.log(`Added user ${users[0].userid} ${users[0].username}`);
				} else if ( users.length == 0) {
					console.log( 'No user selected' );
				}
				
			}
			console.log('done' );
		}
	}
};