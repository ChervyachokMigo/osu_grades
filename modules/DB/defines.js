const { DataTypes } = require('@sequelize/core');
const config = require('../../modules/config_control.js');
const { prepareDB, prepareEND, add_model_names } = require('mysql-tools');

let config_data = config.get_data();

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME_BEATMAPS, DB_NAME_SCORES } = config_data;

module.exports = {

	prepareDB: async () => {

		const MYSQL_CREDENTIALS = { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DATABASES: [DB_NAME_BEATMAPS, DB_NAME_SCORES] };

		const connections = await prepareDB(MYSQL_CREDENTIALS);

		const osu_beatmaps_connection = connections[0];
		const osu_scores_connection = connections[1];

		const beatmaps_md5 = osu_beatmaps_connection.define ('beatmaps_md5', {
			id: {type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, unique: true, index: true },
			hash: {type: DataTypes.STRING(32), allowNull: false, unique: true, index: true},
		});

		const osu_beatmap_id = osu_beatmaps_connection.define ('beatmap_id', {
			md5: {type: DataTypes.INTEGER, allowNull: false, unique: true, primaryKey: true},
			beatmap_id: {type: DataTypes.INTEGER, allowNull: false},
			beatmapset_id: {type: DataTypes.INTEGER, allowNull: false},
			gamemode: {type: DataTypes.TINYINT.UNSIGNED, allowNull: false},
			ranked: {type: DataTypes.TINYINT, allowNull: false},
		});

		const beatmap_info = osu_beatmaps_connection.define ('beatmap_info', {
			md5: {type: DataTypes.INTEGER,allowNull: false, unique: true, primaryKey: true},
			artist: {type: DataTypes.STRING, allowNull: false},
			title: {type: DataTypes.STRING, allowNull: false},
			creator: {type: DataTypes.STRING, allowNull: false},
			difficulty: {type: DataTypes.STRING, allowNull: false},
		});

		beatmaps_md5.hasOne(osu_beatmap_id, { foreignKey: 'md5', foreignKeyConstraints: false});
		beatmaps_md5.hasOne(beatmap_info, { foreignKey: 'md5',  foreignKeyConstraints: false});

		osu_beatmap_id.hasOne(beatmap_info, { foreignKey: 'md5',  foreignKeyConstraints: false});

		const osu_score_legacy = osu_scores_connection.define ('osu_score_legacy', {
			md5: {type: DataTypes.INTEGER, allowNull: false},
			beatmap_id: {type: DataTypes.INTEGER, allowNull: false},
			id: {type: DataTypes.BIGINT, allowNull: false, unique: true, primaryKey: true},
			userid: {type: DataTypes.INTEGER, allowNull: false},
			gamemode: {type: DataTypes.TINYINT, defaultvalue: 0, allowNull: false},
			rank: {type: DataTypes.TINYINT, allowNull: false},
			date: {type: DataTypes.STRING, allowNull: false},
			total_score: {type: DataTypes.INTEGER, allowNull: false},
			max_combo: {type: DataTypes.INTEGER, allowNull: false},
			pp: {type: DataTypes.FLOAT, allowNull: false},
			mods: {type: DataTypes.STRING, allowNull: false},
			best: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false},
			count_50: {type: DataTypes.INTEGER, defaultValue:0, allowNull: false},
			count_100: {type: DataTypes.INTEGER, defaultValue:0, allowNull: false},
			count_300: {type: DataTypes.INTEGER, defaultValue:0, allowNull: false},
			count_katu: {type: DataTypes.INTEGER, defaultValue:0, allowNull: false},
			count_geki: {type: DataTypes.INTEGER, defaultValue:0, allowNull: false},
			count_miss: {type: DataTypes.INTEGER, defaultValue:0, allowNull: false},
			is_fc: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false},
		}, { noPrimaryKey: false });

		const osu_score = osu_scores_connection.define ('osu_score', {
			md5: {type: DataTypes.INTEGER, allowNull: false},
			beatmap_id: {type: DataTypes.INTEGER, allowNull: false},
			id: {type: DataTypes.BIGINT, allowNull: false, unique: true, primaryKey: true},
			legacy_id: {type: DataTypes.BIGINT, defaultValue: 0, allowNull: false},
			userid: {type: DataTypes.INTEGER, allowNull: false},
			gamemode: {type: DataTypes.TINYINT, defaultValue: 0, allowNull: false},
			rank: {type: DataTypes.TINYINT, allowNull: false},
			accuracy: {type: DataTypes.FLOAT, allowNull: false},
			date: {type: DataTypes.STRING,  allowNull: false},
			total_score: {type: DataTypes.INTEGER, allowNull: false},
			legacy_total_score: {type: DataTypes.BIGINT, defaultValue: 0n, allowNull: false},
			max_combo: {type: DataTypes.INTEGER, allowNull: false},
			pp: {type: DataTypes.FLOAT, defaultValue: 0, allowNull: false},
			mods: {type: DataTypes.STRING, defaultValue: 'No Mods', allowNull: false},
			passed: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false},
			ranked: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false},
			best: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false},
			count_meh: {type: DataTypes.INTEGER, defaultValue:0, allowNull: false},
			count_ok: {type: DataTypes.INTEGER, defaultValue:0, allowNull: false},
			count_great: {type: DataTypes.INTEGER, defaultValue:0, allowNull: false},
			count_miss: {type: DataTypes.INTEGER, defaultValue:0, allowNull: false},
			is_fc: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false},
			legacy_is_fc: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false},

		}, { noPrimaryKey: false });

		const osu_user_grade = osu_scores_connection.define ('osu_user_grade', {
			userid: {type: DataTypes.INTEGER, allowNull: false, key: 'user', unique: 'user' },
			gamemode: {type: DataTypes.TINYINT, allowNull: false, key: 'user', unique: 'user' },
			score_mode: {type: DataTypes.TINYINT, allowNull: false, key: 'user', unique: 'user' },
			username: {type: DataTypes.STRING, allowNull: false, defaultValue: '' },
			F: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
			D: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
			C: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
			B: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
			A: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
			S: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
			X: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
			SH: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
			XH: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false},
		}, { noPrimaryKey: false });

		osu_user_grade.hasMany( osu_score_legacy, { foreignKey: 'userid',  foreignKeyConstraints: false });
		osu_user_grade.hasMany( osu_score, { foreignKey: 'userid',  foreignKeyConstraints: false });

		beatmaps_md5.hasMany( osu_score_legacy, { foreignKey: 'md5',  foreignKeyConstraints: false });
		beatmaps_md5.hasMany( osu_score, { foreignKey: 'md5',  foreignKeyConstraints: false });

		add_model_names({ names: 'beatmaps_md5', model: beatmaps_md5 });
		add_model_names({ names: 'beatmap_id', model: osu_beatmap_id });
		add_model_names({ names: 'beatmap_info', model: beatmap_info });

		add_model_names({ names: 'osu_score_legacy', model: osu_score_legacy });
		add_model_names({ names: 'osu_score', model: osu_score });
		add_model_names({ names: 'osu_user_grade', model: osu_user_grade });

		await prepareEND();

		return true;
	},

};