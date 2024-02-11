const { auth, v2 } = require('osu-api-extended');

const load_osu_db = require('../tools/load_osu_db');

const { login, password } = require('../config');

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

    //get osu db data
    const osu_db = load_osu_db();
    if (!osu_db){
        console.error('[osu_db] > is not exists');
        return;
    }

    //auth osu
    console.log('authing to osu');
    await auth.login_lazer( login, password );

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