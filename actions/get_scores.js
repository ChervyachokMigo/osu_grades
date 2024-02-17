
const { v2 } = require('osu-api-extended');
const { Op } = require('@sequelize/core');

const osu_auth = require('../tools/osu_auth');
const { gamemode, check_gamemode, print_processed, check_userid } = require("../tools/misc");

const find_beatmaps = require('../tools/find_beatmaps');

const { RankedStatus } = require('osu-tools');

const { save_score, save_scores } = require('../modules/DB/scores');
const { osu_score } = require('../modules/DB/defines');

module.exports = async( args ) => {
    console.log('getting scores');

    const userid = check_userid(args.shift());
    if (!userid) return;

    //check gamemode
    const ruleset = check_gamemode(args.shift());

    //check continue
    let continue_md5 = args.shift() || null;
    if (continue_md5 && continue_md5.length !==32){
        console.error('[continue_md5] > wrong md5 hash');
        return;
    }
    let is_continue = continue_md5 ? true : false;

    //load scores from db
    const scores_db = await osu_score.findAll({ 
        where: { userid }, 
        logging: false, 
        raw: true
    });
    console.log('scores', scores_db.length, 'already saved')

    //load beatmaps from DB
    const beatmaps_db = (await find_beatmaps({ 
        gamemode: { [Op.between]: [0, 3] }, 
        ranked: RankedStatus.ranked }))
        .filter( x => x.beatmap_id > 0 );
    console.log('founded', beatmaps_db.length, 'beatmaps');

    //auth osu
    console.log('authing to osu');
    await osu_auth();

    //start process
    console.log('starting to send requests');
    let i = 0;
    for (let beatmap of beatmaps_db){
        i++;
        
        //go to md5 and continue
        if (is_continue){
            if ( beatmap.md5 === continue_md5 ) {
                console.log('continue from', continue_md5);

                print_processed(i, beatmaps_db.length);

                is_continue = false;
            } else {
                continue;
            }
        }

        //skip gamemodes
        if ( ruleset.idx > -1 && beatmap.gamemode !== ruleset.idx ){
            continue;
        }

        //print percent every 1000 beatmaps
        if (i % 1000 == 0) {
            print_processed(i, beatmaps_db.length);
        }

        try {
            const data = await v2.scores.user.beatmap( beatmap.beatmap_id, userid, { mode: gamemode[beatmap.gamemode], best_only: false });
            
            if (!data || data.length === 0){
                // no scores for beatmap
                continue;
            }

            const scores = data.map( x => { return {...x, md5: beatmap.md5 }});
            await save_scores(scores);

        } catch (e) {
            console.log( beatmap );
            console.error( e );
            break;
        }
    }
}