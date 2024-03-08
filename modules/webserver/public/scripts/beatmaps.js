
let is_beatmaps_created = false;

const create_beatmaps = ( data_json ) => {
	if (is_beatmaps_created) {
		return false;
	}

	data_json.forEach( ({ gamemode, count, beatmaps_count }) => {
		const gamemode_img = document.createElement('img');
		gamemode_img.className = 'gamemode_image_' + gamemode;
		gamemode_img.src = `./images/mode_${gamemode}.svg`;
		const gamemode_img_div = document.createElement('div');
		gamemode_img_div.className = 'gamemode_image_div_' + gamemode;
		gamemode_img_div.appendChild( gamemode_img );

		const score_count = document.createElement('div');
		score_count.className = 'scores_' + gamemode + '_count';
		score_count.innerHTML = `${count}/${beatmaps_count}`;

		const score_div = document.createElement('div');
		score_div.className ='scores_' + gamemode;
		score_div.appendChild( gamemode_img_div );
		score_div.appendChild( score_count );
		$( '.content' ).append( score_div );

	});
	
	is_beatmaps_created = true;
};

const  refresh_beatmaps = ( data_json ) => {
	create_beatmaps ( data_json );
	data_json.forEach( ({ gamemode, count, beatmaps_count }) => $( '.scores_' + gamemode + '_count' ).text( `${count}/${beatmaps_count}` ) );
};
