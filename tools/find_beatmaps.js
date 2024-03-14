
const { beatmaps_md5, osu_beatmap_id } = require('../modules/DB/defines');

module.exports = async ({ 
	beatmap_md5 = null, 
	beatmap_id = null, 
	beatmapset_id = null, 
	gamemode = null, 
	ranked = null,
	single = false,
}) => {
	const md5_condition = beatmap_md5 ? { hash: beatmap_md5 } : {};

	const beatmap_where = {};
	if (gamemode && gamemode >= 0 )
		beatmap_where.gamemode = gamemode;
	if (ranked)
		beatmap_where.ranked = ranked;
	if (beatmap_id) 
		beatmap_where.beatmap_id = beatmap_id;
	if (beatmapset_id) 
		beatmap_where.beatmapset_id = beatmapset_id;

	const options = {
		where: beatmap_where,

		include: [{ model: beatmaps_md5, where: md5_condition }],
        
		fieldMap: {
			'beatmaps_md5.hash': 'md5',

			'beatmaps_md5.id': 'md5_int',
			'beatmap_id.md5': 'md5_int',

			'beatmap_id.beatmap_id': 'beatmap_id',
			'beatmap_id.beatmapset_id': 'beatmapset_id',
			'beatmap_id.gamemode': 'gamemode',
			'beatmap_id.ranked': 'ranked'
		},
    
		order: [['md5', 'ASC']],

		raw: true, 
	};

	if (single) {
		return await osu_beatmap_id.findOne(options);
	} else {
		return await osu_beatmap_id.findAll(options);
	}
    
};