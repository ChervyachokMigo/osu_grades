const { v2 } = require('osu-api-extended');

module.exports = {
	request_beatmap_user_scores_v2: async ({ beatmap_id, userid, gamemode = null, 
		sort_condition = 'total_score', notice_miss = false, best_only = false }) => {

		const data = await v2.scores.user.beatmap( beatmap_id, userid, { mode: gamemode, best_only }).catch( (e) => {
			console.error( 'request user scores on beatmap error' );
			throw new Error (e);
		});

		if (!data || data.error ){
			console.error( 'Request user scores on beatmap error: ', data?.error );
			return null;
		}

		if (data && typeof data == 'object' && data.length > 0){
			data.sort( (a, b) => b[sort_condition] - a[sort_condition] );            
			return data;
		}

		if (notice_miss) {
			console.error('warning: no scores for beatmap', beatmap_id, 'for user', userid );
		}

		return null;
	},

	request_user_recent_scores_v2: async ({ userid, ruleset, offset = 0, limit = 100 }) => {
		const data = await v2.scores.user.category( userid, 'recent', { mode: ruleset.name, offset, limit }).catch( (e) => {
			console.error( 'request user scores error' );
			throw new Error (e);
		});

		if (!data || data.error ){
			console.error( 'Request user scores error: ', data?.error );
			return null;
		}

		if (data && typeof data == 'object' && data.length > 0){
			return data.map( x => ({...x, beatmap_md5: x.beatmap.checksum }));
		}

		console.error( 'warning! not found scores for user', userid, 'with gamemode', ruleset.name );
		return null;
	},

	request_beatmaps_by_cursor_v2: async ({ query = null, query_strict = false, 
		ruleset, status = 'ranked', cursor_string = null }) => {
		
		const query_checked = query_strict ? '"'+query+'"' : query;

		const search_object = {
			query: query_checked,
			mode: ruleset.idx,
			section: status,
			cursor_string,
		};

		const res = await v2.beatmaps.search( search_object ).catch( (e) => {
			console.error( 'request beatmap error' );
			throw new Error (e);
		});

		if (!res || res.error ){
			console.error( 'Request beatmaps error: ', res?.error );
			return null;
		}

		return res;
	},
};