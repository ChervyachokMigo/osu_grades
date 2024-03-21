const webserver = require('../actions/webserver');
const config = require('../modules/config_control');
const webconfig = require('../modules/webserver/config');

const back_categories = {
	users: 'main',
	update_beatmaps: 'main',
	scores: 'main',
	tools: 'main',
	webserver: 'main',

	refresh_scores: 'scores',
	get_scores: 'scores',
	V2_JSON_RECOUNT: 'scores',
	import_jsons: 'scores',

	db_tools: 'tools',
};

const _this = module.exports = {
	get_category: ( name ) => {
		const current_api_version = config.get_value('api_version');

		let category = _this[name];
		let res = [];

		const back = name !== 'main' && back_categories[name] ? 
			{ name: '< Back', value: { action: 'back', back_category: back_categories[name] }}: null;
		
		if (back) {
			res.push(back);
		}

		if (name === 'webserver') {
			const selected_userid = webconfig.get_value( 'web_selected_userid');
			const is_stopped = 0;
			const is_loaded = 1;
			
			category = [
				...category.variants[ 
					webserver.get_is_loaded() == false ? is_stopped : is_loaded ]
					.map( x => ({ ...x, disabled: selected_userid == 0 }) ),
				...category.values,
			];
			delete category.variants;
		}

		return [...res, ...category.filter( x => x?.versions ? x.versions.includes( current_api_version ) : true )];
	},

	main: [
		{ name: 'Change API version', value: { action: 'change_api_version', args: [] }},
		{ name: 'Users menu >', value: { category: 'users' }},
		{ name: 'Update beatmaps >', value: { category: 'update_beatmaps' }},
		{ name: 'Scores >', value: { category: 'scores' }},
		{ name: 'Webserver >', value: { category: 'webserver' }},
		{ name: 'Tools >', value: { category: 'tools' }},
		{ name: 'Exit', value: { action: 'exit', args: [] } }
	],

	tools: [
		{ name: 'Config edit', value: { action: 'edit_config', args: [] }},
		{ name: 'DB Import/Export >', value: { category: 'db_tools' }},
		{ name: 'Update collections.db', value: { action: 'update_collections', args: [] }, versions: [ 2 ]},
		{ name: 'Update scores.db', value: { action: 'update_osu_scores_db_v1', args: [] }, versions: [ 1 ]},
	],

	scores: [
		{ name: 'Get scores >', value: { category: 'get_scores' }},
		{ name: 'Refresh scores >', value: { category: 'refresh_scores' }, versions: [ 1, 2 ]},
		{ name: 'V2_JSON_RECOUNT >', value: { category: 'V2_JSON_RECOUNT'}, versions: [ 3 ]},
		{ name: 'Import json scores to DB >', value: { category: 'import_jsons' }, versions: [ 3 ]},
	],

	users: [
		{ name: 'Add user', value: { action: 'user', args: ['add'] } },
		{ name: 'Delete user', value: { action: 'user', args: ['delete'] } },
		{ name: 'Show users list ', value: { action: 'user', args: ['list'] } },
	],

	update_beatmaps: [
		{ name: 'Update beatmaps v1 [ALL] from begin', value: { action: 'update_beatmaps_info', args: [-1, 'true'] } },

		{ name: 'Update beatmaps v1 [OSU] from begin', value: { action: 'update_beatmaps_info', args: [0, 'true'] } },
		{ name: 'Update beatmaps v1 [TAIKO] from begin', value: { action: 'update_beatmaps_info', args: [1, 'true'] } },
		{ name: 'Update beatmaps v1 [FRUITS] from begin', value: { action: 'update_beatmaps_info', args: [2, 'true'] } },
		{ name: 'Update beatmaps v1 [MANIA] from begin', value: { action: 'update_beatmaps_info', args: [3, 'true'] } },

		{ name: 'Update beatmaps v1 [ALL] continue', value: { action: 'update_beatmaps_info', args: [-1] } },

		{ name: 'Update beatmaps v1 [OSU] continue', value: { action: 'update_beatmaps_info', args: [0] } },
		{ name: 'Update beatmaps v1 [TAIKO] continue', value: { action: 'update_beatmaps_info', args: [1] } },
		{ name: 'Update beatmaps v1 [FRUITS] continue', value: { action: 'update_beatmaps_info', args: [2] } },
		{ name: 'Update beatmaps v1 [MANIA] continue', value: { action: 'update_beatmaps_info', args: [3] } },

		{ name: 'Update beatmaps v2 [ALL] from begin', value: { action: 'update_beatmaps_info_v2', args: [-1, 1, 'true'] } },

		{ name: 'Update beatmaps v2 [OSU] from begin', value: { action: 'update_beatmaps_info_v2', args: [0, 1, 'true'] } },
		{ name: 'Update beatmaps v2 [TAIKO] from begin', value: { action: 'update_beatmaps_info_v2', args: [1, 1, 'true'] } },
		{ name: 'Update beatmaps v2 [FRUITS] from begin', value: { action: 'update_beatmaps_info_v2', args: [2, 1, 'true'] } },
		{ name: 'Update beatmaps v2 [MANIA] from begin', value: { action: 'update_beatmaps_info_v2', args: [3, 1, 'true'] } },

		{ name: 'Update beatmaps v2 [ALL] continue', value: { action: 'update_beatmaps_info_v2', args: [-1, 1, 'false'] } },

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
		{ name: 'Refresh all v1', value: { action:'refresh_all', args: [1, -2] }, versions: [ 1 ]},

		{ name: 'Refresh [OSU] v1', value: { action:'refresh_all', args: [1, 0] }, versions: [ 1 ] },
		{ name: 'Refresh [TAIKO] v1', value: { action:'refresh_all', args: [1, 1] }, versions: [ 1 ] },
		{ name: 'Refresh [FRUITS] v1', value: { action:'refresh_all', args: [1, 2] }, versions: [ 1 ] },
		{ name: 'Refresh [MANIA] v1', value: { action:'refresh_all', args: [1, 3] }, versions: [ 1 ] },

		{ name: 'Refresh all v2', value: { action:'refresh_all', args: [2, -2] }, versions: [ 2 ]},

		{ name: 'Refresh [OSU] v2', value: { action:'refresh_all', args: [2, 0] }, versions: [ 2 ] },
		{ name: 'Refresh [TAIKO] v2', value: { action:'refresh_all', args: [2, 1] }, versions: [ 2 ]},
		{ name: 'Refresh [FRUITS] v2', value: { action:'refresh_all', args: [2, 2] }, versions: [ 2 ]},
		{ name: 'Refresh [MANIA] v2', value: { action:'refresh_all', args: [2, 3] }, versions: [ 2 ]},

		{ name: 'Refresh all v2 JSON', value: { action:'refresh_all', args: [3, -2] }, versions: [ 3 ]},

		{ name: 'Refresh [OSU] v2 JSON', value: { action:'refresh_all', args: [3, 0] }, versions: [ 3 ]},
		{ name: 'Refresh [TAIKO] v2 JSON', value: { action:'refresh_all', args: [3, 1] }, versions: [ 3 ]},
		{ name: 'Refresh [FRUITS] v2 JSON', value: { action:'refresh_all', args: [3, 2] }, versions: [ 3 ]},
		{ name: 'Refresh [MANIA] v2 JSON', value: { action:'refresh_all', args: [3, 3] }, versions: [ 3 ]},
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