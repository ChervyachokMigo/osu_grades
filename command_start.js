const { readdirSync } = require('fs');
const path = require('path');

const action_modules = readdirSync('actions', { encoding: 'utf8' });

const actions = action_modules.map( filename => ({ 
	name: path.basename( filename, '.js' ),
	_args: require( `./actions/${filename}` ).args,
	F: require( `./actions/${filename}` ).action,
}));

module.exports = async (args) => {
	console.log('preparing commands');

	const action = args.shift();

	for ( let { name, _args, F } of actions ) {
		if ( name === action ){
			console.log( 'executting command:', action );
			const parsed_args = Object.assign( {}, ...args.map( (v, i) => ({ [ _args[i] ? _args[i] : i ] : v })));
			await F( parsed_args );
			console.log( 'complete\n' );
			return;
		}
	}

	console.error(`undefined action: ${action}\navailable actions:`, actions.map( v => v.name).join(', '));
};


// посчитать количество карт по статусам
// при запуске запустить beatmap check
// разделение на в1 в2 джсон (по конфигу мб) (лаунчер)
// сделать config editor
// починить импорт базы
// сделать upadate beatmaps all
// update beatmaps qualified, loved, approved and scores
