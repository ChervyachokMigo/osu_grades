const { RankedStatus } = require('osu-tools');

const osu_auth = require('../tools/osu_auth');
const find_beatmaps = require('../tools/find_beatmaps');
const { check_gamemode, print_processed, check_userid } = require("../tools/misc");

module.exports = async({ args, init = async () => {}, callback }) => {
    //check userid
    const userid = check_userid( args.userid );
    if (!userid) return;

    //check gamemode
    const ruleset = check_gamemode( args.gamemode );

    //check continue
    let continue_md5 = args.continue_md5 || null;
    if ( continue_md5 && continue_md5.length !==32 ){
        console.error( '[continue_md5] > wrong md5 hash' );
        return;
    }
    let is_continue = continue_md5 ? true : false;

    await init( userid );

    //load beatmaps from DB
    const beatmaps_db = ( await find_beatmaps({ ranked: RankedStatus.ranked }))
        .filter( x => x.beatmap_id > 0 );
    console.log( 'founded', beatmaps_db.length, 'ranked beatmaps' );

    //auth osu
    console.log('authing to osu');
    await osu_auth();

    //start process
    console.log( 'starting to send requests' );
    let i = -1;
    for ( let beatmap of beatmaps_db ){
        i++;
        print_processed({ current: i, size: beatmaps_db.length, frequency: Math.trunc(beatmaps_db.length / 50), name: 'beatmaps' });

        //go to md5 and continue
        if (is_continue){
            if ( beatmap.md5 === continue_md5 ) {
                console.log( 'continue from', continue_md5 );
                print_processed({ current: i, size: beatmaps_db.length, frequency: beatmaps_db.length / 10000, name: 'beatmaps', force: true });
                is_continue = false;
            } else {
                continue;
            }
        }

        //skip gamemodes if setted game mode 0 - 3
        if ( ruleset.idx > -1 && beatmap.gamemode !== ruleset.idx ){
            continue;
        }

        if ( await callback( beatmap, userid ) ){
            break;
        };

    }
}
