
const { check_gamemode, Num } = require('../tools/misc');
const { text_score_mode, gamemode } = require('../misc/const');

module.exports = {
    args: ['score_mode', 'gamemode'],
    action: async( args ) => {
        const score_mode = Num( args.score_mode, 2 );

        if (!score_mode || isNaN(score_mode) || score_mode < 1 || score_mode > 3 ){
            console.error('scoring mode invalid:', score_mode);
            return;
        }

        console.log( `=== selected score ${text_score_mode[score_mode]} mode` );

        //check gamemode
        const ruleset = check_gamemode( args.gamemode );

        const score_modes = [
            { i: 1, F: require('./refresh_v1').action }, 
            { i: 2, F: require('./refresh_v2').action }, 
            { i: 3, F: require('./refresh_v2_json').action },
        ];

        const users = [5275518, 9547517, 9708920, 20024750];

        if (users.length == 0) {
            console.log('no users for refreshing')
            return;
        }

        // Perform refreshes
        for (let userid of users) {
            // single gamemode
            if (ruleset.idx >= -1 && ruleset.idx <= 3 ) {
                for (let {i, F} of score_modes) {
                    if (score_mode === i ){
                        await F({ userid, gamemode: ruleset.idx });
                    }
                }
            } else {
                // all gamemodes (args gamemode = -2)
                for (let mode in gamemode) {
                    for (let {i, F} of score_modes) {
                        if ( score_mode === i ){
                            await F({ userid, gamemode: mode });
                        }
                    }
                }
}}}}