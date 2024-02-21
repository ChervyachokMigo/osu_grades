const { readdirSync } = require('fs');
const path = require('path');

const { folder_prepare } = require('./tools/misc');
const { prepareDB } = require('./modules/DB/defines');

const args = process.argv.slice(2);

const action_modules = readdirSync('actions', { encoding: 'utf8' });

const actions = action_modules.map( filename => ({ 
	name: path.basename( filename, '.js' ),
	_args: require( `./actions/${filename}` ).args,
	F: require( `./actions/${filename}` ).action,
}));

const command_exec = async () => {
	console.log('preparing commands');

	const action = args.shift();

	folder_prepare('data');

	await prepareDB();

	for ( let { name, _args, F } of actions ) {
		if ( name === action ){
			console.log( 'executting command:', action );
			const parsed_args = Object.assign( {}, ...args.map( (v, i) => ({ [ _args[i] ? _args[i] : i ] : v })));
			await F( parsed_args );
			console.log( 'complete\n' );
			process.exit();
			return;
		}
	}

	console.error(`undefined action: ${action}\navailable actions:`, actions.map( v => v.name).join(', '));
};

command_exec();

// посчитать количество карт по статусам 
// при запуске запустить beatmap check
// фильтровать грейды по md5_int
// разделение на в1 в2 джсон (по конфигу мб) и убрать osu_auth, не нужен для в1
// каунтинг грейдов для дб
// сделать config editor
// сделать лаунчер
// сделать апи для вывода подсчитанных результатов с автообновлением
// сделать экспорт базы
// поиск карт v2
// MYSQL_SAVE fix сохранение 