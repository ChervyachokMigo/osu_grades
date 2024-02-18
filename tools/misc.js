const { existsSync, mkdirSync } = require('fs');
const { gamemode } = require('../misc/const');

module.exports = {
    folder_prepare: (path) =>{
        try{
            if (!existsSync(path)) 
                mkdirSync(path, {recursive: true}); 
            return true;
        } catch (e) {
            console.error('Cannot create folder:', path);
            console.error(e);
            return false;
        }
    },

    check_gamemode: (mode_arg) => {
        let mode_idx = typeof mode_arg === 'undefined' ? -2 : Number(mode_arg);
        mode_idx = (isNaN(mode_arg) || mode_arg < -1 || mode_arg > 3 ) ? -2 : Number(mode_arg); 

        if ( mode_idx >= 0 && mode_arg <= 3 ){
            console.log('gamemode:', gamemode[mode_idx]);
            return { 
                name: gamemode[mode_idx], 
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
        console.log('processed', (current / size * 100).toFixed(2), '% beatmaps,', `(${current}/${size})`);
    },

    check_userid: (str) => {
        const userid = Number(str) || null;
        if (!userid || isNaN(userid) || userid == 0){
            console.error('userid invalid:', userid);
            return null;
        }
        return userid;
    },

    Num: (x, default_value = 0) => !isNaN(Number(x))? Number(x) : default_value,

    convert_ranked: ( beatmap_ranked ) => {
        switch ( beatmap_ranked ) {
            // graveyard
            case -2: return 2;
            // wip
            case -1: return 2;
            // pending
            case 0:  return 2;
            // ranked
            case 1:  return 4;
            // approved
            case 2:  return 5;
            // qualified
            case 3:  return 6;
            // loved
            case 4:  return 7;
            // unknown
            default: return 0;

            // 1 //unsubmitted
        }
    },

}