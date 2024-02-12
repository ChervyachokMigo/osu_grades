
const { folder_prepare, check_gamemode, gamemode } = require('../tools/misc');
const { scores_folder_path } = require('../const');
const { readdirSync } = require('fs');
const refresh = require('./refresh');

module.exports = async( args ) => {

    //check gamemode
    const ruleset = check_gamemode(args.shift());

    //check scores folder
    folder_prepare(scores_folder_path);

    const users = readdirSync(scores_folder_path, {encoding: 'utf8'} );

    if (users.length == 0) {
        console.log('no users for refreshing')
        return;
    }

    for (let userid of users)
        if (ruleset.idx === -1)
            for (let mode in gamemode)
                await refresh( [userid, mode] );
            
        else 
            await refresh( [userid, ruleset.idx] );

}