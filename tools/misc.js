const { existsSync, mkdirSync } = require('fs');

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
        const mode_idx = typeof mode_arg === 'undefined' || isNaN(mode_arg) || mode_arg > 3 ? -1 : mode_arg; 
        if (mode_idx > -1){
            console.log('gamemode:', module.exports.gamemode[mode_idx]);
            return {name: module.exports.gamemode[mode_idx], idx: mode_idx};
        } else {
            console.log('gamemode: all');
            return {name: null, idx: mode_idx};
        }
    }

}