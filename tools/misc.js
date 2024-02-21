const { existsSync, mkdirSync } = require('fs');

const { gamemode, print_progress_frequency } = require('../misc/const');

const _this = module.exports = {
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

    get_ruleset_by_gamemode_int: ( val ) => {
        const idx = isNaN( Number(val)) ? -1 : Number(val);

        return { 
            name: (idx >= 0 && idx <=3) ? gamemode[idx] : 'all', 
            idx,
        };
    },

    check_gamemode: ( val ) => {
        const idx = typeof val === 'undefined' ? -2 : 
            ( isNaN( Number(val) ) || val < -1 || val > 3 ) ? -2 : 
                Number(val);

        if ( idx >= 0 && idx <= 3 ){

            console.log('gamemode:', gamemode[idx]);
            return { 
                name: gamemode[idx], 
                idx,
            };

        } else if (idx == -1) {

            console.log('gamemode: all');
            return { 
                name: null, 
                idx: -1
            };

        // if (idx == -2) by default
        } else {
            console.log('gamemode: every');
            return { 
                name: null, 
                idx,
            };
        }
    },

    check_score_mode: ( val ) => {
        const res = _this.Num( val, 2 );
        if (!res || isNaN(res) || res < 1 || res > 3 ){
            console.error( 'score mode invalid:', val );
            return null
        }
        return res;
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

    check_userid: ( val ) => {
        const userid = Number(val) || null;
        if ( !userid || isNaN( userid ) || userid == 0 ){
            console.error( 'userid invalid:', userid );
            return null;
        }
        return userid;
    },

    Num: ( x, default_value = 0 ) => !isNaN( Number(x) ) ? Number(x) : default_value,

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

    util: (args) => {
        console.log( require('util').inspect( args, {showHidden: true, depth: null, colors: true }) );
    },
    group_by(array, property) {
        return array.reduce((memo, x) => {
            memo[x[property]] ||= [];
            memo[x[property]].push(x);
            return memo;
        }, {});
    }

}