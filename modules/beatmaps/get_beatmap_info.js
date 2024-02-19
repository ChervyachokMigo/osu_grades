const axios = require("axios");
const { api_key } = require("../../data/config");

module.exports = async ( md5 ) => {
    const response = await axios(`https://osu.ppy.sh/api/get_beatmaps?k=${api_key}&h=${md5}&limit=1`);
    
    if ( !response || !response.data || response.data.length == 0 ) {
        return null;
    }

    return response.data.shift();
}