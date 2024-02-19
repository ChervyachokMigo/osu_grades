const input = require('input');

const users = require("../modules/DB/users");
const { check_gamemode, check_userid, check_score_mode } = require("../tools/misc");
const { request_user_info } = require('../modules/osu_requests_v1');
const { text_score_mode, gamemode } = require("../misc/const");

const user_actions = [ 
    { name: 'add', desc: 'Add/Change', F: users.action_add }, 
    { name: 'delete', desc: 'Delete', F: users.action_delete },
    { name: 'list', desc: 'Show list', F: users.action_list },
];

module.exports = {
    args: ['action', 'score_mode', 'userid', 'gamemode'],
    action: async( args ) => {
        //check action
        const user_action = user_actions.find( v => v.name === args.action );
        if (user_action){
            console.log( ` === user action ${user_action.desc} === ` );
        } else {
            console.error( 'no defined action for user with', args.action );
            return;}

        if (user_action.name === 'list') {
            console.log( await user_action.F() );
            return;
        }

        if (user_action.name === 'delete') {
            const header = ` UserID\t\tScore Mode\tGamemode\tUsername\r\n`;
            console.log( header );
            const variants = await users.list_all();
            const delete_record = await input.select(variants.map( x => ({ name: x.text, value: { userid: x.userid, gamemode: x.gamemode }})));
            await users.action_delete(delete_record);
            return;
        }

        // action 'add'

        // get and normalize soce mode
        const score_mode = check_score_mode( args.score_mode || Number( await input.select( 
            text_score_mode.filter( v => v) .map( (x, i) => ({ name: x, value: i + 1 }) )) ));
        if (!score_mode) return;

        // get and normalize user id
        const userid = check_userid( args.userid || Number(await input.text( 'Enter osu user id:' )) ); 
        if (!userid) return;

        // valid user id on bancho and get username
        const osu_user = await request_user_info({ userid });
        if (!osu_user) return;
        const username = osu_user.username;

        // get and normalize gamemode
        const selected_rulesets = ( args.gamemode ? [ args.gamemode ] : ( await input.checkboxes( 
            ['all', ...gamemode].map( (x, i) => ({ name: x, value: i - 1 })) ))).map( x => check_gamemode( x ) );

        await user_action.F({ selected_rulesets, userid, score_mode, username });

    }
}