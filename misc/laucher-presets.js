
const back_categories = {
	test1: 'main',
	test4: 'test1',
	users: 'main',

	update_beatmaps: 'main',
	refresh_scores: 'main',
	db_tools: 'main',
	import_jsons: 'main',
};

module.exports = {
	get_category: ( name ) => {
		let res = [];

		const back = name !== 'main' && back_categories[name] ? 
			{ name: '< Back', value: { action: 'back', back_category: back_categories[name] }}: null;
		
		if (back) {
			res.push(back);
		}

		return [...res, ...module.exports[name]];
	},

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

	db_tools: [
		{ name: 'Export tables', value: { action: 'table_export_csv', args: [] } },
		{ name: 'Import tables', value: { action: 'table_import_csv', args: [] } },
	],

	import_jsons: [
		{ name: 'Import jsons to scores v1', value: { action: 'import_jsons_to_db', args: [1] } },
		{ name: 'Import jsons to scores v2', value: { action: 'import_jsons_to_db', args: [2] } },
	],

	test4: [
		{ name: 'test5', value: { action: 'test5', args: [1] } },
		{ name: 'test6', value: { action: 'test6', args: [2] } },
	],

	test1: [
		{ name: 'test2', value: { action: 'test2', args: [1] } },
		{ name: 'test3', value: { action: 'test3', args: [2] } },
		{ name: 'test4 >', value: { category: 'test4' }},
	],

	main: [
		{ name: 'Test 1 >', value: { category: 'test1' }},
		{ name: 'Users menu >', value: { category: 'users' }},
		{ name: 'Update beatmaps >', value: { category: 'update_beatmaps' }},
		{ name: 'Refresh scores >', value: { category: 'refresh_scores' }},
		{ name: 'DB Tools >', value: { category: 'db_tools' }},
		{ name: 'Import json scores to DB >', value: { category: 'import_jsons' }},
		{ name: 'Webserver >', value: { action: 'webserver', args: [] }},
		{ name: 'Exit', value: { action: 'exit', args: [] } }
	],

};