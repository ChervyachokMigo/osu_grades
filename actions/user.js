const input = require('input');

const users = require("../modules/DB/users");
const { check_gamemode, check_userid, check_score_mode } = require("../tools/misc");

const { text_score_mode, gamemode } = require("../misc/const");

const add_user = async ({ userid, score_mode, ruleset }) => {
    const res = await users.add({ userid, score_type: score_mode, gamemode: ruleset.idx });
    if (res) console.log('add new user', userid, 'score type:', text_score_mode[score_mode], 'gamemode:', ruleset.name );
}

module.exports = {
    args: ['action', 'score_mode', 'userid', 'gamemode'],
    action: async( args ) => {

        const score_mode = check_score_mode( args.score_mode || Number(await input.select( text_score_mode.filter( v => v))) + 1 );
        if (!score_mode) return;

        const userid = check_userid( args.userid || Number(await input.text( 'Enter osu user id:' )) ); 
        if (!userid) return;
        
        const gamemodes = (args.gamemode ? [ args.gamemode ] : (await input.checkboxes( ['all', ...gamemode] )).map( x => gamemode.indexOf(x) ?? -1 )).map( x => check_gamemode( x ) );

        switch (args.action) {
            case 'add':
                // all modes
                if ( gamemodes.findIndex( x => x.idx == -1) > -1 ) {
                    for (let mode in gamemode) {
                        await add_user({ userid, score_mode, ruleset: { name: gamemode[mode], idx: mode }});
                    }
                // selected mods
                } else {
                    for (let ruleset of gamemodes) {
                        await add_user({ userid, score_mode, ruleset });
                    }
                }
                break;
            default:
                console.error( 'no defined action for user with', args.action );
        }
    }
}