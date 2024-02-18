const axios = require('axios');
const get_scores_loop = require('../tools/get_scores_loop');
const { save_scores_v1 } = require('../modules/scores/v1');
const { api_key } = require('../data/config');

module.exports = async( args ) => {
    console.log('getting scores with v1');

    await get_scores_loop( args, async (beatmap, userid) => {

        try{
            console.log('requesting beatmap', beatmap.md5)
            const url = `https://osu.ppy.sh/api/get_scores?k=${api_key}&b=${beatmap.beatmap_id}&u=${userid}&m=${beatmap.gamemode}`;
            const res = await axios( url );
            
            if (!res.data || res.data.length === 0){
                // no scores for beatmap
            } else {
                const scores = res.data.map( score => ({ score, beatmap }));
                await save_scores_v1( scores );
            }

        } catch (e) {

            console.log( beatmap );
            console.error( e );
            return true;
            
        }

    });


}
