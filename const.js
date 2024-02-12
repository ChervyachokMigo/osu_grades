const path = require('path');

module.exports = {
    osu_db_parsed_path: path.join('data', 'osu.db.json'),
    csv_folder_path: path.join('data', 'csv'),
    beatmap_ids_csv_filename: 'beatmap_ids.csv',
    scores_folder_path: path.join('data', 'scores'),
    scores_v1_folder_path: path.join('data', 'scores_v1'),
    osu_token_path: path.join('data', 'osu_token.json'),
}