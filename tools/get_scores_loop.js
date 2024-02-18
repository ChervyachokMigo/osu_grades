const { RankedStatus } = require('osu-tools');
const { Op } = require('@sequelize/core');

const osu_auth = require('../tools/osu_auth');
const find_beatmaps = require('../tools/find_beatmaps');
const { check_gamemode, print_processed, check_userid } = require("../tools/misc");

const { osu_score } = require('../modules/DB/defines');
const { print_progress_frequency } = require('../data/config');
const { scores_folder_path } = require('../misc/const');

module.exports = async({ args, init = async () => {}, callback }) => {
    //check userid
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

    await init(userid);

    //load scores from db
    const scores_db = await osu_score.findAll({ 
        where: { userid }, 
        logging: false, 
        raw: true
    });
    console.log('scores', scores_db.length, 'already saved');

    //load beatmaps from DB
    const beatmaps_db = (await find_beatmaps({ 
        gamemode: { [Op.between]: [0, 3] }, 
        ranked: RankedStatus.ranked }))
        .filter( x => x.beatmap_id > 0 );
    console.log('founded', beatmaps_db.length, 'ranked beatmaps');

    //auth osu
    console.log('authing to osu');
    await osu_auth();

    //start process
    console.log('starting to send requests');
    let i = 0;
    console.time('requesting')
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

        //skip gamemodes if setted game mode 0 - 3
        if ( ruleset.idx > -1 && beatmap.gamemode !== ruleset.idx ){
            continue;
        }

        //print percent every 1000 beatmaps
        if ( i % (1000 / print_progress_frequency) == 0 ) {
            print_processed( i, beatmaps_db.length );
            console.timeLog( 'requesting', i );
        }

        const result = await callback( beatmap, userid );

        if (result === true) {
            break;
        }
    }
}
