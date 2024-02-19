const { Num, convert_ranked } = require("../../tools/misc");
const { MYSQL_SAVE } = require("../DB/base");
const { get_md5_id } = require("../DB/tools");

const convert_v1_to_db = ( beatmap_v1 ) => ({
    checksum: beatmap_v1.file_md5,
    beatmap_id: Num(beatmap_v1.beatmap_id),
    beatmapset_id: Num(beatmap_v1.beatmapset_id),
    gamemode: Num(beatmap_v1.mode),
    ranked: convert_ranked(Number(beatmap_v1.approved)),
    artist: beatmap_v1.artist || beatmap_v1.artist_unicode || '',
    title: beatmap_v1.title || beatmap_v1.title_unicode || '',
    creator: beatmap_v1.creator || '',
    difficulty: beatmap_v1.version || ''
})

module.exports = async ( beatmap_v1 ) => {
    if (!beatmap) {
        console.error('ignore beatmap for adding in db');
        return;
    }

    const beatmap = convert_v1_to_db( beatmap_v1 )
    const beatmap_md5_id = await get_md5_id( beatmap.checksum );
    
    try {
        await MYSQL_SAVE('beatmap_info', { md5: beatmap_md5_id }, {
            artist: beatmap.artist,
            title: beatmap.title,
            creator: beatmap.creator,
            difficulty: beatmap.difficulty
        });
        await MYSQL_SAVE('beatmap_id', { md5: beatmap_md5_id }, {
            beatmap_id: beatmap.beatmap_id,
            beatmapset_id: beatmap.beatmapset_id,
            gamemode: beatmap.gamemode,
            ranked: beatmap.ranked,
        });

        return beatmap;
        
    } catch (e) {
        console.log( beatmap_v1 );
        throw new Error(e);
    }
}