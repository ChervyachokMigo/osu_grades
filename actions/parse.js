const path = require('path');
const { writeFileSync } = require('fs');
const { osu_db_load, beatmap_property } = require('osu-tools');

const { osu_db_folder } = require('../config.js');
const { osu_db_parsed_path } = require('../const.js');

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
    console.log('parsing osu.db');
    try {
        const results = osu_db_load( osu_db_path, beatmap_props );
        writeFileSync( osu_db_parsed_path, JSON.stringify(results.beatmaps), { encoding: 'utf8' });
        console.log('parsed', results.beatmaps.length, 'beatmap records');
    } catch (e) {
        console.log(e);
    }
};