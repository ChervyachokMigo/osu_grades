const { check_gamemode, check_userid, check_score_mode } = require("../tools/misc");

module.exports = {
    args: ['action', 'score_mode', 'userid', 'gamemode'],
    action: async( args ) => {
        const score_mode = check_score_mode( args.score_mode );
        if (!score_mode) return;

        const userid = check_userid( args.userid );
        if (!userid) return;

        const ruleset = check_gamemode( args.gamemode );


        switch (args.action) {
            case 'add':

                break;
            default:
                console.error( 'no defined action for user with', args.action );
        }
    }
}