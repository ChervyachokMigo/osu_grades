

const WebSocket = require('ws');
const { isJSON } = require('../../tools/misc');
const refresh_v2 = require('../../actions/refresh_v2');
const config = require('./config');
const users = require('../DB/users');
const { rank_to_int } = require('../../misc/const');
const { count_scores_by_gamemode } = require('../DB/scores');

const client_send = async ( client, action, response_data ) => 
	await client.send( JSON.stringify({ action, response_data }) );

const refresh_scores = async ({ userid, gamemode }) => {
	const is_all = gamemode < 0;
	if (is_all){
		for ( let i = 0; i < 4; i++ ){
			await refresh_v2.action({ userid, gamemode: i });
		}
	} else {
		await refresh_v2.action({ userid, gamemode });
	}
};

let interval = null;
let clients = [];

const client_change_type = (client_id, type) => {
	const idx = clients.findIndex( x => x.id === client_id);
	if ( idx > -1 ){
		clients[idx].type = type;
	}
};

const _this = module.exports = {
	clients_terminate: async () => {
		for ( let i in clients ) {
			await clients[i].terminate();
		}
	},

	refresh_grades_action: async ({ clients, userid, gamemode, sort_method }) => {
		if ( clients.length > 0 ){
			await refresh_scores({ userid, gamemode }).finally( async () => {
	
				let grades_sum = {};
				const grades_names = Object.keys(rank_to_int);
				grades_names.forEach( x => grades_sum[x] = 0 );
				const grades_db = (await users.findAll({ userid, gamemode, score_mode: 2 }));
				grades_db.forEach( x => grades_names.forEach( y => grades_sum[y] += x[y] ));
				delete grades_sum.F;

				const count_scores = await count_scores_by_gamemode({ userid, gamemode });

				for (let client of clients){

					if (client.type === 'grades'){
						await client_send( client, 'refresh_grades', { userid, gamemode, grades: grades_sum, sort_method });
					} else if (client.type === 'beatmaps') {
						await client_send( client, 'refresh_beatmaps', count_scores );
					} else {
						console.error('undefined client type:', client?.type );
					}
				}

			});
		}
	},

	check_grades: async ({ clients }) => {
		const userid = config.get_value( 'web_selected_userid' );
		const gamemode = config.get_value( 'web_selected_gamemode' );

		const sort_method = config.get_value('sort_method' );
		const is_web_autoupdating = config.get_value( 'is_web_autoupdating' );
		const autoupdate_time_sec = config.get_value( 'web_autoupdate_time_sec' );
		if (is_web_autoupdating && !interval ) {
			interval = setInterval( _this.refresh_grades_action, autoupdate_time_sec * 1000, { clients, userid, gamemode, sort_method });
		}
		await _this.refresh_grades_action({ clients, userid, gamemode, sort_method });
	},

	init_socket_server: () => {
		const GRADES_SOCKET_PORT = config.get_value( 'GRADES_SOCKET_PORT' );

		_this.SOCKET_SERVER = new WebSocket.WebSocketServer({ port: GRADES_SOCKET_PORT });
		
		_this.SOCKET_SERVER.on('close', async () => {
			console.log('socket server closed');
			if (interval) {
				clearInterval( interval );
				interval = null;
			}
		});

		_this.SOCKET_SERVER.on('connection',  async (client) => {
			client.id = new Date().getTime();
			client.type = null;

			console.log('new connection');

			client.on('error', () => console.error);
            
			client.on('close', () => {
				console.log('connection closed');
				for ( let i in clients ) {
					if ( clients[i].id === client.id ){
						clients.splice(i, 1);
					}
				}
				if (clients.length == 0 && interval) {
					clearInterval( interval );
					interval = null;
				}
			});

			client.on('message', async (data) => {
				console.log('received: ' + data);

				if (isJSON(data)){
					
					// eslint-disable-next-line no-unused-vars
					const {action, request_data} = JSON.parse(data);

					let response_data = null;

					switch (action) {
					case 'connect':
						response_data = 'connection success';
						if (request_data && request_data.script_type) {
							client_change_type(client.id, request_data.script_type);
						}
						
						break;
					default:
						console.error('unknown action');
					}
					
					await client_send( client, action, response_data );
				} else {
					console.error( '"data" is not in JSON format!' );
				}
			});

			clients.push(client); 

			await _this.check_grades({ clients });

		});

		return _this.SOCKET_SERVER;
	},

	clients_send: async (action, data) => {
		if (clients.length === 0){
			return false;
		}
    
		for (let c of clients) {
			await client_send(c, action, data);
		}
	},

};