module.exports = {
	DB_HOST: '127.0.0.1', 
	DB_PORT: '3306', 
	DB_USER: '', 
	DB_PASSWORD: '', 

	DB_NAME_BEATMAPS: 'osu_beatmaps',
	DB_NAME_SCORES: 'osu_scores',

	// v1 (osu legacy)
	api_key: '',

	// v2 (osu laser)
	api_v2_app_id: '',
	api_v2_app_key: '',

	backup_instead_remove: true,
	print_progress_import_jsons_frequency: 100,

	is_use_caching: true,
	is_delete_cache: true,
	cache_expire_time_hours: 24,
	
	osu_path: 'C:\\osu!',

	is_loved_select: false,
};