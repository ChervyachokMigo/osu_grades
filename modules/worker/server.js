const { WebSocket } = require('ws');
const config = require('../config_control.js');
const { isJSON } = require('../../tools/misc.js');
const get_scores_loop_async = require('../../tools/loops/get_scores_loop_async.js');

const clients = [];

const client_send = async ( client, action, response_data ) => 
	await client.send( JSON.stringify({ action, response_data }) );

const state = {
	working: false
}

const _this = module.exports = {
	//create server
	init: async () => {
		return await new Promise( (res, rej) => {
			const worker_port = config.get_value( 'WORKER_SERVER_PORT' );

			const worker_connection = new WebSocket.WebSocketServer({ host: '127.0.0.1', port: worker_port });

			worker_connection.on('listening', () => {
				const worker_name = worker_connection.address();
				console.log(`[${worker_name.address}:${worker_name.port}] listening`);
				res(worker_connection);
			});


			worker_connection.on('close', async () => {
				const worker_name = worker_connection.address();
				console.log(`[${worker_name.address}:${worker_name.port}] socket server closed`);
			});

			worker_connection.on('connection',  async (client) => {
				const worker_name = worker_connection.address();

				await client_send(client, 'connection', { state });

				if (state.working == true) {
					console.error(`[${worker_name.address}:${worker_name.port}] [WORKER_SERVER] Error: server is already working`);
					return false;
				}

				client.id = new Date().getTime();
			
				console.log(`[${worker_name.address}:${worker_name.port}] new connection ${client.id}`);

				client.on('error', () => console.error);
				
				client.on('close', () => {
					console.log(`[${worker_name.address}:${worker_name.port}] ${client.id} connection closed`);
					for ( let i in clients ) {
						if ( clients[i].id === client.id ){
							clients.splice(i, 1);
						}
					}
				});

				client.on('message', async (data) => {
					const worker_name = worker_connection.address();

					console.log(`[${worker_name.address}:${worker_name.port}] received data: `, data);
					
					if (isJSON(data)){
						
						const {action, request_data} = JSON.parse(data);

						let response_data = null;

						switch (action) {
						case 'connect':
							response_data = 'connection success';					
							break;
						case 'ping':
							response_data = 'pong';                        
							break;
						case 'get_scores_v2':
							//console.log('request_data', request_data)
							response_data = await get_scores_loop_async({ args: {...request_data, beatmaps_mode: 'list' }, score_mode: 2 });
                            break;
                        case 'get_scores_v1':

						default:
							console.error(`[${worker_name.address}:${worker_name.port}] [WORKER_SERVER] Error: unknown action`);
						}
						console.log(`[${worker_name.address}:${worker_name.port}] ${client.id} client send response data`, response_data)
						await client_send( client, action, response_data );
					} else {
						console.error( `[${worker_name.address}:${worker_name.port}] "data" is not in JSON format!` );
					}
				});

				clients.push(client); 

			});
		});
	},

	clients_send: async (action, data) => {
		if (clients.length === 0){
			return false;
		}
    
		for (let c of clients) {
			await client_send(c, action, data);
		}
	},

	clients_terminate: async () => {
		for ( let i in clients ) {
			await clients[i].terminate();
		}
	},
}