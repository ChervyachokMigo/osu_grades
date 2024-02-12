const { v2 } = require('osu-api-extended');

const osu_auth = require('../tools/osu_auth');

module.exports = async( args ) => {
    console.log('getting scores');

    //check userid
    const userid = Number(args.shift()) || null;
    if (!userid || isNaN(userid) || userid == 0){
        console.error('userid invalid:', userid);
        return;
    }

    //check beatmap_id
    const beatmap_id = Number(args.shift()) || null;
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
        const data = await v2.scores.user.beatmap( beatmap_id, userid, { best_only: false });
        if (!data || data.length === 0){
            console.error('warning:', 'not scores for beatmap', beatmap_id);
            return;
        }
        
        data.sort( (a, b) => b.total_score - a.total_score);

        console.log(data);

    } catch (e) {

        console.log( userid, beatmap_id );
        console.error(e);
        return;
        
    }

}