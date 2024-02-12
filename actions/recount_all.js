
const { folder_prepare, check_gamemode } = require('../tools/misc');
const { scores_folder_path } = require('../const');
const { readdirSync } = require('fs');
const refresh = require('./refresh');
const count_grades = require('./count_grades');
const get_list = require('./get_list');

module.exports = async( args ) => {

    //check scores folder
    folder_prepare(scores_folder_path);

    const users = readdirSync(scores_folder_path, {encoding: 'utf8'} );

    if (users.length == 0) {
        console.log('no users for refreshing')
        return;
    }

    for (let userid of users){
        count_grades([ userid ]);
        get_list([ userid ]);
    }
}