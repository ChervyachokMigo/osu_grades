
const { check_gamemode, Num } = require('../tools/misc');
const { text_score_mode, gamemode } = require('../misc/const');

const refresh_v1 = require('./refresh_v1');
const refresh_v2 = require('./refresh_v2');
const refresh_v2_json = require('./refresh_v2_json');

module.exports = async( args ) => {


    const score_mode = Num( args.shift(), 2 );

    if (!score_mode || isNaN(score_mode) || score_mode < 1 || score_mode > 3 ){
        console.error('scoring mode invalid:', score_mode);
        return;
    }

    console.log( `=== selected score ${text_score_mode[score_mode]} mode` );

    //check gamemode
    const ruleset = check_gamemode( args.shift() );

    const users = [5275518, 9547517, 9708920, 20024750];

    if (users.length == 0) {
        console.log('no users for refreshing')
        return;
    }

    
    for (let userid of users) {
        if (ruleset.idx >= -1 && ruleset.idx <= 3 ) {
            if (score_mode === 1) {
                await refresh_v1( [userid, ruleset.idx] );
            } else if (score_mode === 2) {
                await refresh_v2( [userid, ruleset.idx] );
            } else if (score_mode === 3) {
                await refresh_v2_json( [userid, ruleset.idx] );
            }
        } else {
            for (let mode in gamemode) {
                if (score_mode === 1) {
                    await refresh_v1( [userid, mode] );
                } else if (score_mode === 2) {
                    await refresh_v2( [userid, mode] );
                } else if (score_mode === 3) {
                    await refresh_v2_json( [userid, mode] );
                }
            }
        }
    }
}