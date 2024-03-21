const axios = require('axios');

const find_beatmaps = require('../tools/find_beatmaps');
const { Num } = require('../tools/misc');

const { get_cache, set_cache } = require('./cache');
const { beatmaps_v1_request_limit } = require('../misc/const');

const config = require('./config_control');

module.exports = {
	request_beatmap_user_scores: async ({ beatmap, userid }) => {
		const api_key = config.get_value('api_key');
		if (!api_key) return null;

		const url = `https://osu.ppy.sh/api/get_scores?k=${api_key}&b=${beatmap.beatmap_id}&u=${userid}&m=${beatmap.gamemode}`;
		const res = await axios( url );
        
		if (res && res.data && typeof res.data == 'object' && res.data.length > 0){
			const scores = res.data.map( score => ({ score, beatmap }));
			return scores;
		} else {
			return null;
		}
	},

	request_user_recent_scores: async ({ userid, ruleset }) => {
		const api_key = config.get_value('api_key');
		if (!api_key) return null;

		const url = `https://osu.ppy.sh/api/get_user_recent?k=${api_key}&u=${userid}&m=${ruleset.idx}&limit=50`;
		const res = await axios( url );

		if (res && res.data && typeof res.data == 'object' && res.data.length > 0){
			const data = res.data.filter( x => x.score_id && Num( x.beatmap_id ));
			const scores = (await Promise.all( await data.map( 
				async score => ({ score, beatmap: 
					await find_beatmaps({ gamemode: ruleset.idx, beatmap_id: Num(score.beatmap_id), single: true }) })
			)));
                
			if (scores.length > 0) {
				return scores;
			}
		}

		console.log( 'warning! not found scores for user', userid, 'with gamemode', ruleset.name );
		return null;
	},

	// for v1
	request_beatmaps_by_date: async ( params ) => {
		const is_use_caching = config.get_value('is_use_caching');
		const api_key = config.get_value('api_key');
		if (!api_key) return null;

		const this_params = { 
			since_date: params.since_date || null, 
			limit: params.limit || beatmaps_v1_request_limit, 
			gamemode: params.gamemode || 0 
		};

		if (is_use_caching) {
			const cache_data = get_cache('beatmaps_v1', this_params );
			if (cache_data) return cache_data;
		}
		
		const url = `https://osu.ppy.sh/api/get_beatmaps?k=${api_key}&since=${this_params.since_date}` +
			`${ this_params.gamemode >= 0 ? `&m=${this_params.gamemode}` : '' }&limit=${this_params.limit}`;
			
		const res = await axios( url );

		if ( res && res.data && typeof res.data == 'object' ){
			if (is_use_caching && res.data.length >= beatmaps_v1_request_limit) {
				set_cache('beatmaps_v1', this_params, res.data);
			}
			return res.data;
		}

		console.error('bancho not response beatmaps');
		return null;
	},

	// for jsons
	request_beatmap_by_md5: async ({ md5 }) => {
		const api_key = config.get_value('api_key');
		if (!api_key) return null;

		const url = `https://osu.ppy.sh/api/get_beatmaps?k=${api_key}&h=${md5}&limit=1`;
		const res = await axios( url );
        
		if ( res && res.data && typeof res.data == 'object' && res.data.length > 0 ) {
			return res.data.shift();
		}

		console.error( 'no beatmap info on bancho by md5', md5 );
		return null;
	},

	/**
     * 
     * @param beatmap set required
     * @param gamemode optional
     */
	// for jsons
	request_beatmap_by_id: async ({ beatmap, gamemode }) => {
		const api_key = config.get_value('api_key');
		if (!api_key) return null;

		const url = `https://osu.ppy.sh/api/get_beatmaps?k=${api_key}&b=${beatmap}${ gamemode >= 0 ? `&m=${gamemode}` : '' }&limit=1`;
		const res = await axios( url );

		if ( res && res.data && typeof res.data == 'object' && res.data.length > 0 ) {
			return res.data.shift();
		}

		console.error( 'no beatmap info on bancho by beatmap id', beatmap );
		return null;
	},

	request_user_info: async ({ userid }) => {
		const api_key = config.get_value('api_key');
		if (!api_key) return null;

		const url = `https://osu.ppy.sh/api/get_user?k=${api_key}&u=${userid}`;
		const res = await axios( url );
        
		if ( res && res.data && typeof res.data == 'object' && res.data.length > 0 ) {
			return res.data.shift();
		}

		console.error('userid is not exists on bancho', userid);
		return null;
	}

};