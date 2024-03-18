const { gamemode, text_score_mode } = require('./const');

module.exports = {
	found_X_scores_beatmap: ({ length, userid, beatmap }) =>
		`found ${length} scores of beatmap ${beatmap.md5} for user ${userid} with gamemode ${gamemode[beatmap.gamemode]}`,

	found_new_X_scores_beatmap: ({ length, beatmap, userid }) =>
		`found new ${length} scores of beatmap ${beatmap.md5} for user ${userid} with gamemode ${gamemode[beatmap.gamemode]}`,

	found_X_scores_gamemode: ({ length, userid, gamemode_int }) =>
		`found ${length} scores for user ${userid} with gamemode ${gamemode[gamemode_int]}`,
		
	found_new_X_scores_gamemode: ({ length, userid, gamemode_int }) =>
		`found new ${length} scores for user ${userid} with gamemode ${gamemode[gamemode_int]}`,

	add_user_scoremode_gamemode: ({ username, userid, score_mode, ruleset }) =>
		`add new user ${username} (${userid}) with score type: ${text_score_mode[score_mode]} and gamemode: ${ruleset.name}`,

	delete_user_gamemode: ({ userid, score_mode, gamemode_int }) =>
		`delete user id ${userid} with score type: ${text_score_mode[score_mode]} and gamemode: ${gamemode[gamemode_int]}`,

	user_row_record: ({ userid, score_mode, ruleset, username }) =>
		` ${userid}\t${text_score_mode[score_mode]}\t\t${ruleset.name}\t\t${username}\t`,
	
	/*getting_beatmaps_progress: ({ ruleset, beatmaps_length, count_beatmaps, total_beatmaps }) =>
		`getting ${ruleset.name} ${beatmaps_length} beatmaps (${count_beatmaps}/${total_beatmaps}) ${(count_beatmaps/total_beatmaps*100).toFixed(2)} %`,*/

	cache_beatmap_v1_filename: ( params ) => 
		`${params?.since_date}_`+
		`${params?.limit}_`+
		`${params?.gamemode}.json`,

	cache_beatmap_v2_filename: ( params ) => 
		`${params?.cursor_string ? params.cursor_string : 'null'}_` +
		`${params?.mode}_`+
		`${params?.sort}.json`,

	get_scores_load_filename: ( params ) => 
		`get_scores_${params?.userid}_${params.score_mode}_${params.ruleset.idx}.json`,
};