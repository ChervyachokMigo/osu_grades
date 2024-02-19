const { osu_user_grade } = require("./defines");
const { text_score_mode, gamemode } = require("../../misc/const");

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
        if (res) console.log(`add new user ${username} (${userid}) with score type: ${text_score_mode[score_mode]} and gamemode: ${ruleset.name}` );
    },

    find: async (where) => await osu_user_grade.findOne({ where, raw: true, logging: false }),

    findAll: async (where) => await osu_user_grade.findAll ({ where, raw: true,  logging: false }),

    action_add: async ({ selected_rulesets, userid, score_mode, username }) => {
        // all modes
        if ( selected_rulesets.findIndex( x => x.idx == -1) > -1 ) {
            for (let idx in gamemode) {
                const ruleset = { name: gamemode[idx], idx };
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
        return (await _this.findAll({})).map( x => ({ 
            text: ` ${x.userid}\t${text_score_mode[x.score_mode]}\t\t${gamemode[x.gamemode]}\t\t${x.username}\t`,
            userid: x.userid,
            gamemode: x.gamemode,
            username: x.username,
            score_mode: x.score_mode,
        }))
    },

    action_delete: async (where) => {
        return await osu_user_grade.destroy({ where, logging: false });
    },

    action_list: async () => {
        const header = ` UserID\t\tScore Mode\tGamemode\tUsername\r\n`;
        return header + (await _this.list_all()).map( x => x.text + '\r\n' ).join('');
    }
}

