
const { check_gamemode, check_score_mode } = require('../tools/misc');
const { text_score_mode, gamemode } = require('../misc/const');
const users = require('../modules/DB/users');

module.exports = {
	args: ['score_mode', 'gamemode'],
	action: async( args ) => {
		const score_mode = check_score_mode( args.score_mode );
		if (!score_mode) return;

		const score_modes = [
			{ i: 1, F: require('./refresh_v1').action }, 
			{ i: 2, F: require('./refresh_v2').action }, 
			{ i: 3, F: require('./refresh_v2_json').action },
		];

		console.log( `=== selected score ${text_score_mode[score_mode]} mode` );

		//check gamemode
		const ruleset = check_gamemode( args.gamemode );

		// if args is gamemode (0-3) => find users with gamemode
		// else => find users with all gamemodes
		const users_play_options = ruleset.idx >= 0 && ruleset.idx < gamemode.length ? 
			await users.findAll({ score_mode, gamemode: ruleset.idx }) :
			[].concat( ...await Promise.all( 
				gamemode.map( async (x, mode_idx) => await users.findAll({ score_mode, gamemode: mode_idx }) )));
		
		if (!users_play_options || users_play_options.length == 0) {
			console.log( 'no users for refreshing' );
			return;
		}

		for (let opt of users_play_options) {
			const S = score_modes.find( v => v.i === opt.score_mode );
			if (!S) {
				throw new Error('something wrong with score mode');
			}
			await S.F({ userid: opt.userid, gamemode: opt.gamemode });
		}

	}};