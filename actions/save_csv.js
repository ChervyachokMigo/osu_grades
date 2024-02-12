const load_osu_db = require('../tools/load_osu_db');
const save_csv = require('../tools/save_csv');

const { beatmap_ids_csv_filename } = require('../misc/const');

module.exports = () => {
    const osu_db = load_osu_db();
    if (osu_db) {
        save_csv( osu_db, beatmap_ids_csv_filename );
    }
}