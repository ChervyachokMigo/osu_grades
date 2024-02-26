
let connection = null;
let SOCKET_PORT = null;

$( document ).ready( () => {
	SOCKET_PORT = $( '.SOCKET_PORT' ).text();
	connection = new WebSocket( `ws://localhost:${SOCKET_PORT}` );

	connection.onopen = () => {
		connection.onclose = ( ev => {
			console.error( 'connection close' );
			console.log( ev );
			location.reload();
		});
    
		connection.onerror = ( err => {
			console.error( 'connection error' );
			console.log(err);
			location.reload();
		});

		connection.send( JSON.stringify({ action: 'connect' }));
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

		switch (data_json.action){
		case 'connect':
			console.log('connect', data_json);
			break;
		default:
			console.log('no action');
			break;
		}
	};

});



function isJSON(str) {
	try {
		JSON.parse(str.toString());
	} catch (e) {
		return false;
	}
	return true;
}

function toggle_tracking_filter(action, value){
	tracking_filter[value] = !tracking_filter[value];
	connection.send(JSON.stringify({action, data: {value: tracking_filter[value]}}));
}
