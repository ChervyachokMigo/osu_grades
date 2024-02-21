const input = require('input');

const users = require('../modules/DB/users');
const { check_gamemode, check_userid, check_score_mode } = require('../tools/misc');
const { request_user_info } = require('../modules/osu_requests_v1');
const { text_score_mode, gamemode } = require('../misc/const');

const user_actions = [ 
	{ name: 'add', desc: 'Add/Change', F: users.action_add }, 
	{ name: 'delete', desc: 'Delete', F: users.action_delete },
	{ name: 'list', desc: 'Show list', F: users.action_list },
	{ name: 'exit', desc: 'Exit', F: () => { console.log('Complete'); process.exit(); }},
];

const choose_user_action = async () => {
	console.log( ' > Select user action:\n' );
	const res = await input.select( user_actions.map( x => ({ name: x.desc, value: x })) );
	console.clear();
	return res;
};

module.exports = {
	args: ['action', 'score_mode', 'userid', 'gamemode'],
	action: async( args ) => {

		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			//check action
			let user_action = args.action ? user_actions.find( v => v.name === args.action ) : await choose_user_action() ;

			if (user_action){
				if (user_action.name === 'exit'){
					user_action.F();
				}
				console.log( ` === user action ${user_action.desc} === \n` );
			} else {
				console.error( 'undefined action for user:', args.action, '\nallowed actions:', user_actions.map( x => x.name ).join(', '));
				return;
			}

			if (user_action.name === 'list') {
				const res = await user_action.F();
				if ( res.length == 0 ) 
					console.log( ' No users in DB yet\n' ); 
				else 
					console.log( res.text );

			} else if (user_action.name === 'delete') {
				// eslint-disable-next-line no-constant-condition
				while (true){
					const variants = (await users.list_all()).map( x => ({ name: x.text, value: { userid: x.userid, gamemode: x.gamemode }}));

					if (variants.length > 0){
						const header = ' UserID\t\tScore Mode\tGamemode\tUsername\r\n';
						console.log( header );
					}

					if (variants.length > 1) {
						const delete_records = await input.checkboxes( variants );
						for ( let delete_record of delete_records ) {
							await user_action.F( delete_record );
						}
						if (delete_records.length == 0) {
							console.log ('No selected users for deletion.\n');
						}

					} else if ( variants.length === 1) {
						const delete_record = variants[0];
						if( await input.confirm( `${ delete_record.name }\nDo you want delete it?`, {default: false} )) {
							if (await user_action.F( delete_record.value ))
								console.log( 'Now no users in DB' );
							console.clear(); 
							break;
						}
					} else {
						console.log( 'No users in DB yet' );
					}

					if (variants.length > 0){
						const res = await input.confirm('Do you want delete another?');
						if (!res) {
							console.clear(); 
							break;
						}
					} else {
						console.clear(); 
						break;
					}
				}

			} else if (user_action.name === 'add') {
				// eslint-disable-next-line no-constant-condition
				while (true) {
					// action 'add'

					// get and normalize soce mode
					const score_mode = check_score_mode( args.score_mode || Number( await input.select( 
						text_score_mode.filter( v => v) .map( (x, i) => ({ name: x, value: i + 1 }) )) ));
					if (!score_mode) return;

					// get and normalize user id
					const userid = check_userid( args.userid || Number(await input.text( 'Enter osu user id:' )) ); 
					if (!userid) return;

					// valid user id on bancho and get username
					const osu_user = await request_user_info({ userid });
					if (!osu_user) return;
					const username = osu_user.username;

					// get and normalize gamemode
					const selected_rulesets = ( args.gamemode ? [ args.gamemode ] : ( await input.checkboxes( 
						['all', ...gamemode].map( (x, i) => ({ name: x, value: i - 1 })) ))).map( x => check_gamemode( x ) );

					await user_action.F({ selected_rulesets, userid, score_mode, username });

					const res = await input.confirm('Want do you add another?', {default: false} );
                
					if (!res) {
						console.clear(); 
						break;
					}
				}
			}

			if (args.action) {
				process.exit();
			}

		}

	}
};