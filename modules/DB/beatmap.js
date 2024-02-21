const { Num, import_beatmap_status } = require('../../tools/misc');
const { MYSQL_SAVE } = require('./base');
const { get_md5_id } = require('./tools');

const convert_v1_to_db = ( beatmap_v1 ) => ({
	md5: beatmap_v1.file_md5,
	beatmap_id: Num(beatmap_v1.beatmap_id),
	beatmapset_id: Num(beatmap_v1.beatmapset_id),
	gamemode: Num(beatmap_v1.mode),
	ranked: import_beatmap_status(Number(beatmap_v1.approved)),
	artist: beatmap_v1.artist || beatmap_v1.artist_unicode || '',
	title: beatmap_v1.title || beatmap_v1.title_unicode || '',
	creator: beatmap_v1.creator || '',
	difficulty: beatmap_v1.version || ''
});

const convert_v2_to_db = ( beatmapset, beatmap_v2 ) => ({
	md5: beatmap_v2.checksum,
	beatmap_id: Num(beatmap_v2.id),
	beatmapset_id: Num(beatmap_v2.beatmapset_id),
	gamemode: Num(beatmap_v2.mode_int),
	ranked: import_beatmap_status(Number(beatmap_v2.ranked)),
	artist: beatmapset.artist || beatmapset.artist_unicode || '',
	title: beatmapset.title || beatmapset.title_unicode || '',
	creator: beatmapset.creator || '',
	difficulty: beatmap_v2.version || ''
});

module.exports = {
	save_beatmap_info: async ( beatmap_v1 ) => {
		const beatmap_md5_id = await get_md5_id( beatmap_v1.file_md5 );
		const beatmap = convert_v1_to_db( beatmap_v1 );

		try {
			await MYSQL_SAVE( 'beatmap_info', { md5: beatmap_md5_id }, {
				artist: beatmap.artist,
				title: beatmap.title,
				creator: beatmap.creator,
				difficulty: beatmap.difficulty
			});

			await MYSQL_SAVE( 'beatmap_id', { md5: beatmap_md5_id }, {
				beatmap_id: beatmap.beatmap_id,
				beatmapset_id: beatmap.beatmapset_id,
				gamemode: beatmap.gamemode,
				ranked: beatmap.ranked,
			});
            
			return beatmap;
            
		} catch (e) {
			console.log( 'beatmap_v1', beatmap_v1 );
			throw new Error(e);
		}
	},

	save_beatmaps_info_v2: async ( beatmaps_v2 ) => {
		for (let beatmapset of beatmaps_v2) {
			for (let beatmap of beatmapset.beatmaps) {
				const beatmap_md5_id = await get_md5_id( beatmap.checksum );
				const beatmap_for_db = convert_v2_to_db( beatmapset, beatmap );
				try {
					await MYSQL_SAVE( 'beatmap_info', { md5: beatmap_md5_id }, {
						artist: beatmap_for_db.artist,
						title: beatmap_for_db.title,
						creator: beatmap_for_db.creator,
						difficulty: beatmap_for_db.difficulty
					});

					await MYSQL_SAVE( 'beatmap_id', { md5: beatmap_md5_id }, {
						beatmap_id: beatmap_for_db.beatmap_id,
						beatmapset_id: beatmap_for_db.beatmapset_id,
						gamemode: beatmap_for_db.gamemode,
						ranked: beatmap_for_db.ranked,
					});
				
				} catch (e) {
					console.log( 'beatmaps_v2', beatmaps_v2 );
					throw new Error(e);
				}
			}}
	},

};