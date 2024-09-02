const { WebSocket } = require('ws');
const config = require('../config_control.js');

const servers = [];

const remove_server_connection = (connection) => {
	const index = servers.findIndex( x => x.id === connection.id);
	if (index > -1) {
		servers.splice(index, 1);
	}
}

module.exports = {
	init: async (server_dest) => {
		return await new Promise( (res, rej) => {

			const worker_port = config.get_value( 'WORKER_SERVER_PORT' );

			const worker_connection = new WebSocket(`ws:\\\\${server_dest}:${worker_port}`);

			worker_connection.on('open', () => {
				console.log(`[${server_dest}] WORKER_CLIENT Connected to worker server`);
				worker_connection.id = new Date().getTime();
				servers.push(worker_connection);
				res(worker_connection);
			});
			
			worker_connection.on('close', () => {
				console.log(`[${server_dest}] WORKER_CLIENT disconnected`);
				remove_server_connection(worker_connection);
			});
			
			worker_connection.on('message', (message) => {
				const { action, response_data } = JSON.parse(message);

				switch(action) {
					case 'connection':
						const { state } = response_data;
						
						if (state.working === true){
							console.log(`[${server_dest}] Server is working`);
							remove_server_connection(worker_connection);
						}
						break;
					case 'ping':
						console.log(`WORKER_CLIENT ${worker_connection.id} Received pong from worker server`);
						break;
					case 'get_scores_v2':
						console.log(`[${server_dest}] WORKER_CLIENT ${worker_connection.id} Received scores from worker server`);
						worker_connection.emit( action, response_data );
						//console.log('message', message)
						break;
					default:
						console.error(`[${server_dest}] Unknown action: ${action}`);
                        break;
				}

			});
			
			worker_connection.onerror = (error) => {
				rej(error);
			};

			return worker_connection;
		
		});
	},

	ping: async (server_id) => {
		const server = servers.find( v => v.id === server_id );
		if (!server) {
            return false;
        }

		server.send(JSON.stringify({ action: 'ping' }));
	},

	send: async ( id, action, request_data ) => {
		const connection = servers.find( v => v.id === id );
		if (!connection) {
            return false;
        }

		await connection.send(JSON.stringify({ action, request_data }));
	}
}