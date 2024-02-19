const osu_auth = require('../tools/osu_auth');
const { check_gamemode, check_userid } = require("../tools/misc");

module.exports = async({ args, init = async () => false, callback }) => {
    //check userid
    const userid = check_userid( args.userid );
    if (!userid) return;

    //check gamemode
    const ruleset = check_gamemode( args.gamemode );

    await init( userid );

    //auth osu
    console.log( 'authing to osu' );
    await osu_auth();

    //start process
    console.log( 'updating scores' );
    await callback( userid, ruleset );

}
