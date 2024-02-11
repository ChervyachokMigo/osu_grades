const { folder_prepare } = require('./tools/misc');

const args = process.argv.slice(2);

const command_exec = async () => {
    console.log('preparing commands');

    const action = args.shift();

    folder_prepare('data');

    const actions = [
        { name: 'parse', F: require('./actions/parse')},
        { name: 'save_csv', F: require('./actions/save_csv')},
        { name: 'get_scores', F: require('./actions/get_scores')},
        { name: 'get_scores_v1', F: require('./actions/get_scores_v1')},
        { name: 'count_grades', F: require('./actions/count_grades')},
        { name: 'get_list', F: require('./actions/get_list')},
    ];

    for (let { name, F } of actions) {
        if ( name === action ){
            console.log('executting command:', action);
            console.log('args:', args);
            await F(args);
            console.log('complete');

            return;
        }
    }

    console.error(`undefined action: ${action}\navailable actions:`, actions.map( v => v.name).join(', '));
}

command_exec();

