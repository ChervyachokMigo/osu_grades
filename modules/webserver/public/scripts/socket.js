/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

let SOCKET_PORT = null;

function isJSON(str) {
	try {
		JSON.parse(str.toString());
	} catch (e) {
		return false;
	}
	return true;
}

const socket_init =  (script_type) => {
	SOCKET_PORT = $( '.SOCKET_PORT' ).text();

	const socket_connect = () => {
		return new WebSocket( `ws://localhost:${SOCKET_PORT}` );
	};

	try {
		
		let connection = socket_connect();

		connection.onopen = () => {
			connection.onclose = ( async ev => {
				console.error( 'connection close' );
				console.log( ev );
				location.reload();
			});
    
			connection.onerror = ( async err => {
				console.error( 'connection error' );
				console.log(err);
				location.reload();
			});

			connection.send( JSON.stringify({ action: 'connect', request_data: { script_type } }));
		};
		
		connection.onmessage = (data) => {

			if (!isJSON(data.data)) {
				console.error('is not json');
				return false;
			}

			const data_json = JSON.parse(data.data);

			if (!data_json.action){
				console.error('undefined action');
				return false;
			}

			const actions = [
				{ name: 'connect', F: () => {} },
				{ script_type: 'grades', name: 'refresh_grades', F: () => refresh_grades( data_json.response_data )},
				{ script_type: 'beatmaps', name: 'refresh_beatmaps', F: () => refresh_beatmaps( data_json.response_data )},
			];

			for ( let action of actions ) {
				if ( action.name === data_json.action && (action.script_type ? script_type === action.script_type : true) ){
					console.log( action.name, data_json );
					action.F();
					return true;
				}
			}

			console.error('undefined action',  data_json.action);
		};

	} catch (e){
		console.error(e);
	}
};