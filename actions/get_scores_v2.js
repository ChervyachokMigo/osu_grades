
const get_scores_loop = require('../tools/get_scores_loop');
const { save_scores_v2 } = require('../modules/scores/v2');
const { request_beatmap_user_scores } = require('../modules/osu_requests_v2');
const { gamemode } = require('../misc/const');

module.exports = {
    args: ['userid', 'gamemode', 'continue_md5'],
    action: async( args ) => {
        console.log('getting scores with v2');

        await get_scores_loop({ args, callback: async ( beatmap, userid ) => {
            try {
                const data = await request_beatmap_user_scores({ 
                    beatmap_id: beatmap.beatmap_id, 
                    gamemode: gamemode[beatmap.gamemode_int],
                    userid, });
                
                if (data){
                    const scores = data.map( x => ({ ...x, beatmap_md5: beatmap.md5 }));
                    const res = await save_scores_v2( scores );
                    if (res) {
                        console.log( `found ${res} scores of beatmap ${beatmap.md5} by user ${userid}` );
                    }
                } 

            } catch (e) {
                console.log( 'beatmap', beatmap );
                console.error( e );
                return true;
            }
    }});
}}