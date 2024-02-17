const { existsSync, mkdirSync, readdirSync } = require('fs');

module.exports = {
    gamemode: ['osu', 'taiko', 'fruits', 'mania'],

    folder_prepare: (path) =>{
        try{
            if (!existsSync(path)) {
                mkdirSync(path, {recursive: true}); 
            }
            return true;

        } catch (e) {
            console.error('Cannot create folder:', path);
            console.error(e);
            return false;
        }
    },

    check_gamemode: (mode_arg) => {

        let mode_idx = typeof mode_arg === 'undefined' ? -2 : Number(mode_arg);
        mode_idx = (isNaN(mode_arg) || mode_arg < -1 || mode_arg > 3 ) ? -2 : mode_arg; 

        if ( mode_idx >= 0 && mode_arg <= 3 ){
            console.log('gamemode:', module.exports.gamemode[mode_idx]);
            return { 
                name: module.exports.gamemode[mode_idx], 
                idx: mode_idx
            };
        } else if (mode_idx == -1) {
            console.log('gamemode: all');
            return { 
                name: null, 
                idx: -1
            };
        } else {
            console.log('gamemode: every');
            return { 
                name: null, 
                idx: mode_idx
            };

        }
    },

    print_processed: (current, size) => {
        console.log('processed', (current/size*100).toFixed(2), '% beatmaps,', `(${current}/${size})`);
    },

    check_userid: (str) => {
        const userid = Number(str) || null;
        if (!userid || isNaN(userid) || userid == 0){
            console.error('userid invalid:', userid);
            return null;
        }
        return userid;
    }

}