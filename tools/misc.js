const { existsSync, mkdirSync } = require('fs');
const { gamemode, print_progress_frequency } = require('../misc/const');


module.exports = {
    folder_prepare: ( path ) =>{
        try{
            if ( !existsSync( path )) 
                mkdirSync( path, { recursive: true }); 
            return true;
        } catch (e) {
            console.error( 'Cannot create folder:', path );
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

    print_processed: ({ current, size, initial = 0, 
        frequency = print_progress_frequency, force = false, name, percent_precition = 2, show_percent = true, show_values = true }) => {
        
        const space = ( v ) => v ? v + ' ' : '';

        const percent = Math.trunc( (1 / frequency) * size) || 1;
        const print_current = initial == 0 ? Number(current) + 1 : current;
        if ( force || print_current % percent == 0 || current == initial || print_current == size ) {
            let percent_text = show_percent ? (( current == initial ? 0 : print_current ) / size * 100 ).toFixed(percent_precition) + '%' : '';
            let value_text = show_values ? `(${print_current}/${size})` : '';
            console.log( 'processed ' + space(name) + space(percent_text) + value_text );
        }
    },

    check_userid: ( str ) => {
        const userid = Number(str) || null;
        if ( !userid || isNaN(userid) || userid == 0 ){
            console.error('userid invalid:', userid);
            return null;
        }
        return userid;
    },

    Num: (x, default_value = 0) => !isNaN(Number(x)) ? Number(x) : default_value,

    convert_ranked: ( beatmap_ranked ) => {
        const status = {
          '-2': 2, // graveyard
          '-1': 2, // wip
          '0': 2,  // pending
          '1': 4,  // ranked
          '2': 5,  // approved
          '3': 6,  // qualified
          '4': 7,  // loved
        };
        // 1 //unsubmitted
        return status[beatmap_ranked] ?? 0; // unknown
    },

}