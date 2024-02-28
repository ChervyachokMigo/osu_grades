const input = require('input');

const users = require('../modules/DB/users');
const { check_gamemode, check_userid, check_score_mode } = require('../tools/misc');
const { request_user_info } = require('../modules/osu_requests_v1');
const { text_score_mode, gamemode } = require('../misc/const');

module.exports = {
	args: ['action', 'score_mode', 'userid', 'gamemode'],
	action: async( args ) => {

		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			//check action
			let user_action = args.action;

			if (user_action === 'list') {
				const res = await users.action_list();
				if ( res.length == 0 ) 
					console.log( ' No users in DB yet\n' ); 
				else 
					console.log( res.text );

			} else if (user_action === 'delete') {
				// eslint-disable-next-line no-constant-condition
				let is_continue = true;
				while (is_continue){
					await users.users_variants( 'checkboxes', async ( selected ) => {
						console.log('selected', selected );
						await users.action_delete( selected );
					});

					if ( !(await input.confirm('Do you want delete another?' ))) {
						is_continue = false;
					}
					
				}

			} else if (user_action === 'add') {
				// eslint-disable-next-line no-constant-condition
				while (true) {
					// action 'add'

					// get and normalize soce mode
					const score_mode = check_score_mode( args.score_mode || Number( await input.select( 
						text_score_mode.filter( v => v) .map( (x, i) => ({ name: x, value: i + 1 }) )) ));
					if (!score_mode) break;

					// get and normalize user id
					const userid = check_userid( args.userid || Number(await input.text( 'Enter osu user id:' )) ); 
					if (!userid) break;

					// valid user id on bancho and get username
					const osu_user = await request_user_info({ userid });
					if (!osu_user) break;
					const username = osu_user.username;

					// get and normalize gamemode
					const selected_rulesets = ( args.gamemode ? [ args.gamemode ] : ( await input.checkboxes( 
						['all', ...gamemode].map( (x, i) => ({ name: x, value: i - 1 })) ))).map( x => check_gamemode( x ) );

					await users.action_add({ selected_rulesets, userid, score_mode, username });

					const res = await input.confirm('Want do you add another?', {default: false} );
                
					if (!res) {
						console.clear(); 
						break;
					}
				}
			}

			break;

		}

	}
};