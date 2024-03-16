const input = require('input');

const { osu_user_grade } = require('./defines');
const { gamemode } = require('../../misc/const');
const { users_header } = require('../../misc/text_consts');
const { delete_user_gamemode, add_user_scoremode_gamemode, user_row_record } = require('../../misc/text_templates');
const { get_ruleset_by_gamemode_int } = require('../../tools/misc');
const { Op } = require('@sequelize/core');

const _this = module.exports = {
	add: async ({ userid, ruleset, score_mode, username }) => {
		/*const exist_record = await _this.find({ userid, gamemode: ruleset.idx });

		if (exist_record) {
			await osu_user_grade.destroy({ where: { userid, gamemode: ruleset.idx } });
		}*/

		const res = (await osu_user_grade.upsert({ 
			userid, 
			gamemode: ruleset.idx, 
			score_mode, 
			username,
		})).shift();

		if (res) console.log( add_user_scoremode_gamemode({ username, userid, score_mode, ruleset }) );
	},

	find: async (where) => {
		if (where.gamemode < 0 || typeof where.gamemode === 'undefined') {
			where.gamemode = {[Op.between]: [0, 3]};
		}
		return await osu_user_grade.findOne ({ where, raw: true });
	},

	findAll: async (where) => {
		if (where.gamemode < 0 || typeof where.gamemode === 'undefined') {
			where.gamemode = {[Op.between]: [0, 3]};
		}
		return await osu_user_grade.findAll ({ where, raw: true });
	},

	action_add: async ({ selected_rulesets, userid, score_mode, username }) => {
		// all modes
		if ( selected_rulesets.findIndex( x => x.idx == -1) > -1 ) {
			for (let idx in gamemode) {
				const ruleset = get_ruleset_by_gamemode_int(idx);
				await _this.add({ userid, score_mode, username, ruleset });
			}
		// selected mods
		} else {
			for (let ruleset of selected_rulesets) {
				await _this.add({ userid, score_mode, username, ruleset });
			}
		}
	},

	list_all: async () => (await _this.findAll({})).map(({ userid, score_mode, gamemode, username}) => ({
		text: user_row_record ({userid, score_mode, ruleset: get_ruleset_by_gamemode_int(gamemode), username}),
		userid, score_mode, gamemode, username,
	})),

	action_delete: async ( where ) => {
		const res = await osu_user_grade.destroy({ where });
		if (res) console.log( delete_user_gamemode({ userid: where.userid, score_mode: where.score_mode, gamemode_int: where.gamemode }) );
	},

	action_list: async () => {
		const res = await _this.list_all();
		return { text: users_header + res.map( x => x.text + '\r\n' ).join(''), length: res.length };
	},

	update_grades: async ( where, grades ) => await osu_user_grade.update( grades, { where }),
	
	users_variants: async ( input_type = 'checkboxes', action_selected_callback ) => {
		const variants = (await _this.list_all()).map( x => ({ 
			name: x.text, 
			value: { 
				userid: x.userid, 
				gamemode: x.gamemode,
				score_mode: x.score_mode
			}}));

		if (variants.length > 0){
			console.log ( users_header );
		}

		if (variants.length > 1) {
			const selected_values = await input[input_type]( variants );
			if (selected_values.length == 0) {
				console.log ('No selected users for deletion.\n');
			} else {
				for ( let option_value of selected_values ) {
					await action_selected_callback( option_value );
				}
			}

		} else if ( variants.length === 1) {
			const single_selected = variants[0];
			if( await input.confirm( `${ single_selected.name }\nDo you want select it?`, {default: false} )) {
				await action_selected_callback( single_selected.value );
			}
			
		} else {
			console.log( 'No users in DB yet' );
		}
	}

};
