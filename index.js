const { readdirSync } = require('fs');
const path = require('path');

const { folder_prepare } = require('./tools/misc');
const { prepareDB } = require('./modules/DB/defines');

const args = process.argv.slice(2);

const command_exec = async () => {
    console.log('preparing commands');

    const action = args.shift();

    folder_prepare('data');

    await prepareDB();

    const action_modules = readdirSync('actions', { encoding: 'utf8' });

    const actions = action_modules.map( filename => ({ 
        name: path.basename( filename, '.js' ),
        F: require( `./actions/${filename}` ),
    }));

    for ( let { name, F } of actions ) {
        if ( name === action ){
            console.log('executting command:', action);
            console.log('args:', args);
            await F(args);
            console.log('complete\n');

            return;
        }
    }

    console.error(`undefined action: ${action}\navailable actions:`, actions.map( v => v.name).join(', '));
}

command_exec();

// таблица с юзерами, где будет количество грейдов
// фильтровать грейды по md5_int
// разделение на в1 в2 джсон (по конфигу мб) и убрать osu_auth, не нужен для в1
// каунтинг грейдов для дб
// сделать config editor
// сделать лаунчер
// сделать апи для вывода подсчитанных результатов с автообновлением
// сделать экспорт базы
// import v1 score, get beatmap info