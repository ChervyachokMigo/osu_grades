const path = require('path');
const { writeFileSync } = require('fs');
const { osu_db_load, beatmap_property } = require('osu-tools');

const { osu_db_folder } = require('../../data/config');
const { osu_db_parsed_path } = require('../../misc/const');
const load_osu_db = require('../tools/load_osu_db');

const osu_db_path = path.join(osu_db_folder, 'osu!.db');

const beatmap_props = [
    beatmap_property.beatmap_md5,
    beatmap_property.beatmap_id,
    beatmap_property.beatmapset_id,
    //beatmap_property.artist,
    //beatmap_property.title,
    //beatmap_property.creator,
    //beatmap_property.difficulty,
    beatmap_property.gamemode,
    beatmap_property.ranked_status
];

module.exports = () => {
    console.log('concat osu.db');
    try {
        const results_db = osu_db_load( osu_db_path, beatmap_props );

        let json = load_osu_db(osu_db_parsed_path);
        
        console.log('osu.db size:', results_db.beatmaps.length);
        console.log('saved json size:', json.length);

        const json_set = new Set(json.map( x => x.beatmap_md5 ));

        json = [
            ...json,
            ...results_db.beatmaps.filter( x => !json_set.has(x.beatmap_md5) ),
        ];

        console.log('new json size:', json.length);

        writeFileSync( osu_db_parsed_path, JSON.stringify(json), { encoding: 'utf8' });

    } catch (e) {
        console.log(e);
    }
};