

const WebSocket = require('ws');
const { isJSON } = require('../../tools/misc');
const refresh_v2 = require('../../actions/refresh_v2');
const config = require('./config');

let clients = [];

const client_send = async ( client, action, response_data ) => 
	await client.send( JSON.stringify({ action, response_data }) );

const refresh_grades = async ({ userid, gamemode }) => {
	await refresh_v2.action({ userid, gamemode });
};

const _this = module.exports = {

	init_socket_server: () => {
		
		const GRADES_SOCKET_PORT = config.get_value( 'GRADES_SOCKET_PORT' );
		const web_selected_userid = config.get_value( 'web_selected_userid' );
		const web_selected_gamemode = config.get_value( 'web_selected_gamemode' );

		let SOCKET_SERVER = new WebSocket.WebSocketServer({ port: GRADES_SOCKET_PORT });

		SOCKET_SERVER.on('connection',  (client) => {
			client.id = new Date().getTime();
			clients.push(client);

			console.log('new connection');
            
			client.on('error', console.error);
            
			client.on('close', () => {
				console.log('connection closed');
				for (let i in clients){
					if (clients[i].id === client.id){
						clients.splice(i, 1);
					}
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
						await refresh_grades({ userid: web_selected_userid, gamemode: web_selected_gamemode });
						break;
					default:
						console.log('unknown action');
					}
					await client_send( client, action, response_data );
				} else {
					console.error( '"data" is not in JSON format!' );
				}
			});

		});

		return SOCKET_SERVER;
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