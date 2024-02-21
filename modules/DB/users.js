const { osu_user_grade } = require('./defines');
const { gamemode } = require('../../misc/const');
const { users_header } = require('../../misc/text_consts');
const { delete_user_gamemode, add_user_scoremode_gamemode, user_row_record } = require('../../misc/text_templates');
const { get_ruleset_by_gamemode_int } = require('../../tools/misc');

const _this = module.exports = {
	add: async ({ userid, ruleset, score_mode, username }) => {
		const exist_record = await _this.find({ userid, gamemode: ruleset.idx });
		if (exist_record) {
			await osu_user_grade.destroy({ where: { userid, gamemode: ruleset.idx }, logging: false });
		}
		const res =( await osu_user_grade.upsert(
			{ userid, gamemode: ruleset.idx, score_mode, username },
			{ logging: false }
		)).shift();
		if (res) console.log( add_user_scoremode_gamemode({ username, userid, score_mode, ruleset }) );
	},

	find: async (where) => await osu_user_grade.findOne({ where, raw: true, logging: false }),

	findAll: async (where) => await osu_user_grade.findAll ({ where, raw: true,  logging: false }),

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

	list_all: async () => {
		return (await _this.findAll({})).map( ({userid, score_mode, gammode, username}) => ({
			text: user_row_record ({userid, score_mode, gamemode_int: gammode, username}),
			userid, score_mode, gamemode, username,
		}));
	},

	action_delete: async (where) => {
		const res = await osu_user_grade.destroy({ where, logging: false });
		if (res) console.log( delete_user_gamemode({ userid: where.userid, gamemode_int: where.gamemode }) );
	},

	action_list: async () => {
		const res = await _this.list_all();
		return { text: users_header + res.map( x => x.text + '\r\n' ).join(''), length: res.length };
	}
};
