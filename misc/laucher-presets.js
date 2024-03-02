const { get_is_loaded } = require('../actions/webserver');
const config = require('../modules/webserver/config');

const back_categories = {
	users: 'main',
	update_beatmaps: 'main',
	refresh_scores: 'main',
	db_tools: 'main',
	import_jsons: 'main',
	webserver: 'main',
	get_scores: 'main',
	V2_JSON_RECOUNT: 'main',
};

module.exports = {
	get_category: ( name ) => {
		let category = module.exports[name];
		let res = [];

		const back = name !== 'main' && back_categories[name] ? 
			{ name: '< Back', value: { action: 'back', back_category: back_categories[name] }}: null;
		
		if (back) {
			res.push(back);
		}

		if (name === 'webserver') {
			const selected_userid = config.get_value( 'web_selected_userid');
			const is_stopped = 0;
			const is_loaded = 1;
			
			category = [
				...category.variants[ 
					get_is_loaded() == false ? is_stopped : is_loaded ]
					.map( x => ({ ...x, disabled: selected_userid == 0 }) ),
				...category.values,
			];
			delete category.variants;
		}

		return [...res, ...category];
	},

	main: [
		{ name: 'Users menu >', value: { category: 'users' }},
		{ name: 'Update beatmaps >', value: { category: 'update_beatmaps' }},
		{ name: 'Get scores >', value: { category: 'get_scores' }},
		{ name: 'Refresh scores >', value: { category: 'refresh_scores' }},
		{ name: 'V2_JSON_RECOUNT >', value: { category: 'V2_JSON_RECOUNT' }},
		{ name: 'Webserver >', value: { category: 'webserver' }},
		{ name: 'DB Tools >', value: { category: 'db_tools' }},
		{ name: 'Import json scores to DB >', value: { category: 'import_jsons' }},
		{ name: 'Exit', value: { action: 'exit', args: [] } }
	],

	users: [
		{ name: 'Add/Change user', value: { action: 'user', args: ['add'] } },
		{ name: 'Delete user', value: { action: 'user', args: ['delete'] } },
		{ name: 'Show users list ', value: { action: 'user', args: ['list'] } },
	],

	update_beatmaps: [
		{ name: 'Update beatmaps v1 [OSU] from begin', value: { action: 'update_beatmaps_info', args: [0, 'true'] } },
		{ name: 'Update beatmaps v1 [TAIKO] from begin', value: { action: 'update_beatmaps_info', args: [1, 'true'] } },
		{ name: 'Update beatmaps v1 [FRUITS] from begin', value: { action: 'update_beatmaps_info', args: [2, 'true'] } },
		{ name: 'Update beatmaps v1 [MANIA] from begin', value: { action: 'update_beatmaps_info', args: [3, 'true'] } },

		{ name: 'Update beatmaps v1 [OSU] continue', value: { action: 'update_beatmaps_info', args: [0] } },
		{ name: 'Update beatmaps v1 [TAIKO] continue', value: { action: 'update_beatmaps_info', args: [1] } },
		{ name: 'Update beatmaps v1 [FRUITS] continue', value: { action: 'update_beatmaps_info', args: [2] } },
		{ name: 'Update beatmaps v1 [MANIA] continue', value: { action: 'update_beatmaps_info', args: [3] } },

		{ name: 'Update beatmaps v2 [OSU] from begin', value: { action: 'update_beatmaps_info_v2', args: [0, 1, 'true'] } },
		{ name: 'Update beatmaps v2 [TAIKO] from begin', value: { action: 'update_beatmaps_info_v2', args: [1, 1, 'true'] } },
		{ name: 'Update beatmaps v2 [FRUITS] from begin', value: { action: 'update_beatmaps_info_v2', args: [2, 1, 'true'] } },
		{ name: 'Update beatmaps v2 [MANIA] from begin', value: { action: 'update_beatmaps_info_v2', args: [3, 1, 'true'] } },

		{ name: 'Update beatmaps v2 [OSU] continue', value: { action: 'update_beatmaps_info_v2', args: [0, 1, 'false'] } },
		{ name: 'Update beatmaps v2 [TAIKO] continue', value: { action: 'update_beatmaps_info_v2', args: [1, 1, 'false'] } },
		{ name: 'Update beatmaps v2 [FRUITS] continue', value: { action: 'update_beatmaps_info_v2', args: [2, 1, 'false'] } },
		{ name: 'Update beatmaps v2 [MANIA] continue', value: { action: 'update_beatmaps_info_v2', args: [3, 1, 'false'] } },
	],

	get_scores: [
		{ name: 'From begin', value: { action: 'get_scores_select', args: [] } },
		{ name: 'Continue', value: { action: 'get_scores_select', args: ['load'] } }
	],

	refresh_scores: [
		{ name: 'Refresh all v1', value: { action:'refresh_all', args: [1, -2] } },

		{ name: 'Refresh [OSU] v1', value: { action:'refresh_all', args: [1, 0] } },
		{ name: 'Refresh [TAIKO] v1', value: { action:'refresh_all', args: [1, 1] } },
		{ name: 'Refresh [FRUITS] v1', value: { action:'refresh_all', args: [1, 2] } },
		{ name: 'Refresh [MANIA] v1', value: { action:'refresh_all', args: [1, 3] } },

		{ name: 'Refresh all v2', value: { action:'refresh_all', args: [2, -2] } },

		{ name: 'Refresh [OSU] v2', value: { action:'refresh_all', args: [2, 0] } },
		{ name: 'Refresh [TAIKO] v2', value: { action:'refresh_all', args: [2, 1] } },
		{ name: 'Refresh [FRUITS] v2', value: { action:'refresh_all', args: [2, 2] } },
		{ name: 'Refresh [MANIA] v2', value: { action:'refresh_all', args: [2, 3] } },

		{ name: 'Refresh all v2 JSON', value: { action:'refresh_all', args: [3, -2] } },

		{ name: 'Refresh [OSU] v2 JSON', value: { action:'refresh_all', args: [3, 0] } },
		{ name: 'Refresh [TAIKO] v2 JSON', value: { action:'refresh_all', args: [3, 1] } },
		{ name: 'Refresh [FRUITS] v2 JSON', value: { action:'refresh_all', args: [3, 2] } },
		{ name: 'Refresh [MANIA] v2 JSON', value: { action:'refresh_all', args: [3, 3] } },
	],

	V2_JSON_RECOUNT: [
		{ name: 'Recount ALL', value: { action: 'recount_all_v2_json', args: [] } },
	],

	db_tools: [
		{ name: 'Export tables', value: { action: 'table_export_csv', args: [] } },
		{ name: 'Import tables', value: { action: 'table_import_csv', args: [] } },
	],

	import_jsons: [
		{ name: 'Import jsons to scores v1', value: { action: 'import_jsons_to_db', args: [1] } },
		{ name: 'Import jsons to scores v2', value: { action: 'import_jsons_to_db', args: [2] } },
	],

	webserver: { 
		variants: [[
			{ name: 'Start webserver', value: { action: 'webserver', args: [1] }},
		],[
			{ name: 'Open webpage', value: { action: 'webserver', args: [3] }},
			{ name: 'Stop webserver', value: { action: 'webserver', args: [0] }},
			{ name: 'Restart webserver', value: { action: 'webserver', args: [2] }},
		]],
		values: [
			{ name: 'Edit config', value: { action: 'webserver', args: [4] }},
			{ name: 'Reset config', value: { action: 'webserver', args: [5] }},
		]},

};