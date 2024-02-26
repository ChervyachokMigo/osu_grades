
let connection = null;
let SOCKET_PORT = null;

$( document ).ready( () => {
	SOCKET_PORT = $( '.SOCKET_PORT' ).text();
	connection = new WebSocket( `ws://localhost:${SOCKET_PORT}` );

	connection.onopen = () => {
		connection.onclose = ( ev => {
			console.error( 'connection close' );
			console.log( ev );
			connection.send( JSON.stringify({ action: 'disconnect' }));
			location.reload();
		});
    
		connection.onerror = ( err => {
			console.error( 'connection error' );
			console.log(err);
			connection.send( JSON.stringify({ action: 'disconnect' }));
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
		case 'refresh_grades':
			console.log('refresh_grades', data_json);
			refresh_grades( data_json.response_data );
			break;
		default:
			console.log('no action');
			break;
		}
	};

});

let is_created = false;

const create_grades = ( grades, sort_method = 'D_SS') => {
	if (is_created) {
		return false;
	}

	if (sort_method === 'SS_D') 
		grades = Object.fromEntries( Object.entries( grades ).reverse() );
	else if (sort_method === 'count_asc') 
		grades = Object.fromEntries( Object.entries( grades ).sort( (a, b) => a[1] - b[1] ) );
	else if (sort_method === 'count_desc')
		grades = Object.fromEntries( Object.entries( grades ).sort( (a, b) => b[1] - a[1] ) );

	Object.keys(grades).forEach( x => {
		const rank_img = document.createElement('img');
		rank_img.className = 'grade_image_' + x;
		rank_img.src = `./images/grade_${x}.svg`;

		const rank_count = document.createElement('div');
		rank_count.className = 'grade_' + x + '_count';
		rank_count.innerHTML = 0;

		const rank_div = document.createElement('div');
		rank_div.className = 'grade_' + x;
		rank_div.appendChild( rank_img );
		rank_div.appendChild( rank_count );

		$( '.content' ).append( rank_div ); 
	});
	
	is_created = true;
};

const  refresh_grades = ( data_json, sort_method ) => {
	create_grades( data_json.grades, data_json.sort_method );
	Object.entries( data_json.grades ).forEach( ([rank, count]) => $( '.grade_' + rank + '_count' ).text( count ) );
};


function isJSON(str) {
	try {
		JSON.parse(str.toString());
	} catch (e) {
		return false;
	}
	return true;
}

