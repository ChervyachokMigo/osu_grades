const include = async (js_src) => {
	return new Promise( (res) => {
		const js = document.createElement('script');
		js.type = 'text/javascript';
		js.src = js_src;
		document.body.appendChild(js);
		js.onload = res;
	});
};

const script_type = document.currentScript.getAttribute('script_type');

$(document).ready( async () => {

	switch (script_type) {
	case 'grades':
		await include('./scripts/grades.js');
		break;
	case 'beatmaps':
		await include('./scripts/beatmaps.js');
		break;
	default:
		console.error('wrong script type');
		return;
	}


	await include('./scripts/socket.js').finally( () => socket_init(script_type) );

});