const { prepareDB } = require("./modules/DB/defines");
const config_control = require("./modules/config_control");
const { save_scores_v2 } = require("./modules/scores/v2");
const worker_client = require("./modules/worker/client");
const find_beatmaps = require("./tools/find_beatmaps");
const worker_server = require('osu-grades-worker-node');

config_control.init();

const connections = [
	//{ hostname: '62.109.26.120', client: null },
	{ hostname: '127.0.0.1', client: null},
	//{hostname: 'localhost2', client: null},
];

var chunk_counter = 0;

const userid = 13903685;
const gamemode = 0;

(async () => {

	await prepareDB();

	const beatmapsets = (await find_beatmaps({ ranked: 4, gamemode: gamemode }))
		.filter( x => x.beatmap_id > 0 )
		.filter( beatmap => beatmap.gamemode === gamemode );

	console.log('Found', beatmapsets.length, 'ranked beatmapsets');

	console.time('done');

	const get_beatmapset_chunk = (chunk_size = 102) => {
		const res = beatmapsets.slice(chunk_counter * chunk_size, chunk_counter * chunk_size + chunk_size );
		
		if (res.length === 0) {
			console.log('No more beatmapsets to process');
			console.timeEnd('done');
			return null;
		}

		chunk_counter++;
		return res;
	}

	const send_request = async ({ connection_id, action, userid, gamemode, beatmapsets  }) => {
		const request_params = { userid, gamemode, beatmaps_mode: 'list', beatmapsets };
		await worker_client.send(connection_id, action, request_params);
	}

	for (let i in connections) {
        try {
			connections[i].client = await worker_client.init(connections[i].hostname);

			const send_request_with_chunk = async () => {
				const beatmapsets_chunk = get_beatmapset_chunk();

				if (!beatmapsets_chunk) {
					return false;
				}

				await send_request({ 
					connection_id: connections[i].client.id,
					action: 'get_scores_v2',
					userid: userid,
					gamemode: gamemode,
					beatmapsets: beatmapsets_chunk
				});

				return true;
			}

			if (!(await send_request_with_chunk())) {
				break;
			}

			connections[i].client.on('get_scores_v2', async (data) => {

                if( data && data.length > 0) {
					await save_scores_v2( data );
				}

				if (!(await send_request_with_chunk())) {
					return;
				}
			});
			
			/*const worker_ping_interval = setInterval( () => {
				if ( worker_client.ping(connections[i].client.id) === false ) {
					clearInterval(worker_ping_interval);
				}
			}, 2000);*/

			/*setTimeout( () => {
				server.clients.forEach((socket) => {
					// Soft close
					socket.close();

					process.nextTick(() => {
						if ([socket.OPEN, socket.CLOSING].includes(socket.readyState)) {
						// Socket still hangs, hard close
						socket.terminate();
						}
					});
				});
			}, 3000)*/
		} catch (e) {
			connections[i].client = false;
			//console.error(e);
			console.error(
				`Failed to connect to ${connections[i].hostname}`
            );
		}
    }
	
}) //();