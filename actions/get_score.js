const osu_auth = require('../tools/osu_auth');
const { check_userid } = require('../tools/misc');
const { request_beatmap_user_scores } = require('../modules/osu_requests_v2');

module.exports = {
    args: ['userid', 'beatmap_id'],
    action: async( args ) => {
        console.log('getting scores');

        const userid = check_userid(args.userid);
        if (!userid) return;

        //check beatmap_id
        const beatmap_id = Number(args.beatmap_id) || null;
        if (!beatmap_id || isNaN(beatmap_id) || beatmap_id == 0){
            console.error('beatmap_id invalid:', beatmap_id);
            return;
        }

        //auth osu
        console.log('authing to osu');
        await osu_auth();

        //start process
        console.log('finding score');
        try {

            const data = await request_beatmap_user_scores({ beatmap_id, userid });
            if (data) {
                console.log(data);
            }

        } catch (e) {
            console.log( userid, beatmap_id );
            console.error(e);
            return;
        }
}}