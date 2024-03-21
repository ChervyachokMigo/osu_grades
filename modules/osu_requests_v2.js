const { v2 } = require('osu-api-extended');

const { get_cache, set_cache } = require('./cache');
const { beatmaps_v2_request_limit } = require('../misc/const');
const config = require('./config_control');

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

	/**
	 * Returns request beatmapsets results from api v2 by cursor or other params
	 * @param {*} query string of search query 
	 * @param {*} query_strict true or false for double quotes in search query
	 * @param {*} ruleset ruleset object
	 * @param {*} status status beatmapsets, defaults ranked
	 * @param {*} cursor_string encoded date to cursor_string
	 * @param {*} sort sort_condition, defaults ranked_asc
	 * @returns request results
	 */
	request_beatmaps_by_cursor_v2: async ( params ) => {
		const is_use_caching = config.get_value('is_use_caching');

		const query_strict = params?.query_strict || false;

		const search_object = { 
			query: query_strict && params?.query ? ('"' + params.query + '"') : null,
			cursor_string: params?.cursor_string === 'false' ? null : params?.cursor_string || null, 
			mode: params?.ruleset?.idx >= 0 ? params.ruleset.name : 'std',
			//section: params?.status || 'ranked',
			sort: params?.sort || 'ranked_asc',
		};

		if (is_use_caching && search_object.sort === 'ranked_asc' && !search_object?.query) {
			const cache_data = get_cache('beatmaps_v2', search_object );
			if (cache_data) return cache_data;
		}

		const res = await v2.beatmaps.search( search_object ).catch( (e) => {
			console.error( 'request beatmap error' );
			throw new Error (e);
		});

		if ( res && !res.error && res?.beatmapsets && res?.beatmapsets.length > 0 ){
			if (is_use_caching && res?.beatmapsets && res?.beatmapsets.length >= beatmaps_v2_request_limit) {
				set_cache('beatmaps_v2', search_object, res);
			}
			return res;
		}

		console.error('bancho not response beatmaps');
		res?.error ?? console.error( 'Error:', res?.error );
		return null;
	},
};