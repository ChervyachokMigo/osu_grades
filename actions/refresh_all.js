
const { folder_prepare, check_gamemode, gamemode } = require('../tools/misc');
const { scores_folder_path } = require('../misc/const');

const refresh = require('./refresh');

module.exports = async( args ) => {

    //check gamemode
    const ruleset = check_gamemode(args.shift());

    //check scores folder
    folder_prepare(scores_folder_path);

    const users = [5275518, 9547517, 9708920, 20024750]
    if (users.length == 0) {
        console.log('no users for refreshing')
        return;
    }
    console.log('idx', ruleset.idx)
    for (let userid of users)
        if (ruleset.idx >=-1 && ruleset.idx <=3)
            await refresh( [userid, ruleset.idx] );
        else
            for (let mode in gamemode)
                await refresh( [userid, mode] );

}