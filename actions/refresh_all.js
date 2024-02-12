
const { folder_prepare, check_gamemode } = require('../tools/misc');
const { scores_folder_path } = require('../const');
const { readdirSync } = require('fs');
const refresh = require('./refresh');

module.exports = async( args ) => {

    //check gamemode
    const ruleset = check_gamemode(Number(args.shift()));

    //check scores folder
    folder_prepare(scores_folder_path);

    const users = readdirSync(scores_folder_path, {encoding: 'utf8'} );

    if (users.length == 0) {
        console.log('no users for refreshing')
        return;
    }

    for (let userid of users){
        await refresh( [userid, ruleset.idx] );
    }
}