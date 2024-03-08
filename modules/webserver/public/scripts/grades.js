
let is_grades_created = false;

const create_grades = ( grades, sort_method = 'D_SS') => {
	if (is_grades_created) {
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
	
	is_grades_created = true;
};

const  refresh_grades = ( data_json ) => {
	create_grades( data_json.grades, data_json.sort_method );
	Object.entries( data_json.grades ).forEach( ([rank, count]) => $( '.grade_' + rank + '_count' ).text( count ) );
};
