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

	find: async (where) => await osu_user_grade.findOne({ where, raw: true }),

	findAll: async (where) => {
		if (where.gamemode < 0) {
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

	action_delete: async (where) => {
		const res = await osu_user_grade.destroy({ where });
		if (res) console.log( delete_user_gamemode({ userid: where.userid, gamemode_int: where.gamemode }) );
	},

	action_list: async () => {
		const res = await _this.list_all();
		return { text: users_header + res.map( x => x.text + '\r\n' ).join(''), length: res.length };
	},

	update_grades: async ( where, grades ) => await osu_user_grade.update( grades, { where }),
		
	

};
