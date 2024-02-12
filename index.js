const { readdirSync } = require('fs');
const path = require('path');

const { folder_prepare } = require('./tools/misc');

const args = process.argv.slice(2);

const command_exec = async () => {
    console.log('preparing commands');

    const action = args.shift();

    folder_prepare('data');

    const action_modules = readdirSync('actions', { encoding: 'utf8' });

    const actions = action_modules.map( x => { return { 
        name: path.basename(x, '.js'), 
        F: require(`./actions/${x}`) 
    }});

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

