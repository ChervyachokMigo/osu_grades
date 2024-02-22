const { Num, import_beatmap_status, concat_array_of_arrays } = require('../../tools/misc');
const { MYSQL_SAVE } = require('./base');
const { osu_beatmap_id, beatmap_info } = require('./defines');
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
const convert_beatmapsets_v2_to_db = (beatmapset_v2) => 
	beatmapset_v2.map( beatmapset => 
		beatmapset.beatmaps.map( beatmap => 
			( convert_v2_to_db( beatmapset, beatmap ) )));

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

	save_beatmapsets_v2: async ( beatmapset_v2 ) => {

		// list of hashes
		const hashes = [].concat(...beatmapset_v2.map( (beatmapset) => beatmapset.beatmaps.map( beatmap=> beatmap.checksum )));

		const md5_hashes = await Promise.all(hashes.map( async hash => ({id: await get_md5_id(hash), hash}) ));
		
		const db_data = concat_array_of_arrays( convert_beatmapsets_v2_to_db ( beatmapset_v2) );

		const ids_data = db_data.map( x => ({
			md5: md5_hashes.find( v => v.hash === x.md5).id, 
			beatmap_id: x.beatmap_id, 
			beatmapset_id: x.beatmapset_id, 
			gamemode: x.gamemode, 
			ranked: x.ranked})
		).filter(x=> x.md5);

		const info_data = db_data.map( x => ({
			md5: md5_hashes.find( v => v.hash === x.md5).id, 
			artist: x.artist, 
			title: x.title, 
			creator: x.creator, 
			difficulty: x.difficulty})
		).filter(x=> x.md5);

		const res = (await osu_beatmap_id.bulkCreate( ids_data, {
			ignoreDuplicates: true,
			updateOnDuplicate: [ 'beatmap_id', 'beatmapset_id', 'gamemode', 'ranked']		
		})).map( x => x.dataValues );

		const res2 = (await beatmap_info.bulkCreate( info_data, { 
			ignoreDuplicates: true,
			updateOnDuplicate: [ 'artist', 'title', 'creator', 'difficulty']	
		})).map( x => x.dataValues );

		return { 
			md5_hashes: md5_hashes.length, 
			beatmap_ids: res.length, 
			beatmap_info: res2.length, 
			is_valid: md5_hashes.length == res2.length && res.length == res2.length,
		};

	}

};