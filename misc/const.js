const path = require('path');

module.exports = {
    gamemode: [ 'osu', 'taiko', 'fruits', 'mania' ],
    rank_to_int: { "F": 0, "D": 1, "C": 2, "B": 3, "A": 4, "S": 5, "X": 6, "SH": 7, 'XH': 8 },
    text_score_mode: Array(1).concat([ 'v1 db', 'v2 db', 'v2 json' ]),
    osu_db_parsed_path: path.join('data', 'osu.db.json'),
    csv_folder_path: path.join('data', 'csv'),
    beatmap_ids_csv_filename: 'beatmap_ids.csv',
    scores_folder_path: path.join('data', 'scores'),
    scores_v1_folder_path: path.join('data', 'scores_v1'),
    osu_token_path: path.join('data', 'osu_token.json'),
    scores_storage_path: path.join('data', 'users_scores.json'),
    grades_results_path: 'results',
    scores_backup_path: path.join('data', 'scores_backup')
};

