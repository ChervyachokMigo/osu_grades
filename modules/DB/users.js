const Axios = require("axios");
const { osu_user_grade } = require("./defines");
const { api_key } = require("../../data/config");
const { raw } = require("mysql2");

const get_user_info = async ( userid ) => {
    const response = await Axios(`https://osu.ppy.sh/api/get_user?k=${api_key}&u=${userid}&type=id`);
    
    if ( !response || !response.data || response.data.length == 0 ) {
        return null;
    }

    return response.data.shift();
}


const _this = module.exports = {
    add: async ({ userid, score_type, gamemode }) => {
        if (!await get_user_info( userid )) {
            console.error('userid is not exists on bancho')
            return false;
        } else {
            return (await osu_user_grade.upsert({ userid, score_type, gamemode }, { logging: false })).shift();
        }
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

