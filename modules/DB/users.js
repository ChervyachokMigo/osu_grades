const { osu_user_grade } = require("./defines");
const { request_user_info } = require("../osu_requests_v1");

const _this = module.exports = {
    add: async ({ userid, score_type, gamemode }) => {
        const res = await request_user_info({ userid });
        if (!res) return false;
        
        return ( await osu_user_grade.upsert(
            { userid, score_type, gamemode },
            { logging: false }
        )).shift();
    },

    find: async ({ userid, score_type, gamemode = null }) => await osu_user_grade.findOne({ 
        where: {userid, score_type, gamemode}, 
        raw: true, 
        logging: false 
    }),

    findOrCreate: async ({ userid, score_type, gamemode }) => {
        //if (await _this.find({ userid, score_type, gamemode } ))
    },
}

