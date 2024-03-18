const path = require('path');

module.exports = {
	gamemode: [ 'osu', 'taiko', 'fruits', 'mania' ],
	
	beatmap_status_to_db: {
		'-2': 2,  // graveyard
		'-1': 9,  // wip
		'0':  8,  // pending
		'1':  4,  // ranked
		'2':  5,  // approved
		'3':  6,  // qualified
		'4':  7,  // loved
	},	// 1 //unsubmitted
	// 0 unknown
	beatmap_status_from_db: { 
		'4': 1,  // ranked
		'5': 2,  // approved
		'6': 3,  // qualified
		'7': 4,  // loved
		'8': 0,  // pending
		'9': -1, // wip
		'2': -2, // graveyard
	},

	beatmap_status_bancho_text: {
		'4': 'loved', 
		'3': 'qualified', 
		'1': 'ranked', 
		'0': 'pending',
		'-1': 'wip', 
		'-2': 'graveyard',
	},

	rank_to_int: { 'F': 0, 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5, 'X': 6, 'SH': 7, 'XH': 8 },
	text_score_mode: Array(1).concat([ 'v1', 'v2', 'v2 json' ]),
	rank_sort_methods: [ 'D_SS', 'SS_D', 'count_asc', 'count_desc' ],
	print_progress_frequency: 4,

	beatmaps_v1_request_limit: 500,
	beatmaps_v2_request_limit: 50,

	csv_folder_path: path.join('data', 'csv'),
	scores_folder_path: path.join('data', 'scores'),
	osu_token_path: path.join('data', 'osu_token.json'),
	grades_results_path: 'results',
	scores_backup_path: path.join('data', 'scores_backup'),
	saved_since_date_name: 'update_beatmaps_since_date',
	saved_cursor_v2_beatmaps_name: 'update_beatmaps_cursor_v2',
	cache_path: path.join( 'data', 'cache' ),
	load_path: path.join( 'data', 'load' ),
	webserver_config_path: path.join('data','webserver_config.json'),
	config_path: path.join('data', 'config.json')
};

