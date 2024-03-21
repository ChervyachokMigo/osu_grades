const { createConnection } = require('mysql2/promise');
const { Sequelize, DataTypes } = require('@sequelize/core');
const config = require('../../modules/config_control.js');

let config_data = config.get_data();

let { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME_BEATMAPS, DB_NAME_SCORES } = config_data;

const osu_beatmaps_mysql = new Sequelize( DB_NAME_BEATMAPS, DB_USER, DB_PASSWORD, {
	dialect: 'mysql',
	host: DB_HOST,
	port: DB_PORT, logging: false, noTypeValidation: true, 
	define: {
		updatedAt: false,
		createdAt: false,
		deletedAt: false, 
	},
	pool: {
		max: 30,
		min: 0,
		acquire: 60000,
		idle: 60000
	} 
});

const osu_scores_mysql = new Sequelize( DB_NAME_SCORES, DB_USER, DB_PASSWORD, { 
	dialect: 'mysql',
	host: DB_HOST,
	port: DB_PORT, 
	logging: false, 
	define: {
		updatedAt: false,
		createdAt: false,
		deletedAt: false
	},
	pool: {
		max: 30,
		min: 0,
		acquire: 60000,
		idle: 60000
	} 
});

const beatmaps_md5 = osu_beatmaps_mysql.define ('beatmaps_md5', {
	id: {type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, unique: true, index: true },
	hash: {type: DataTypes.STRING(32), allowNull: false, unique: true, index: true},
});

const osu_beatmap_id = osu_beatmaps_mysql.define ('beatmap_id', {
	md5: {type: DataTypes.INTEGER, allowNull: false, unique: true, primaryKey: true},
	beatmap_id: {type: DataTypes.INTEGER, allowNull: false},
	beatmapset_id: {type: DataTypes.INTEGER, allowNull: false},
	gamemode: {type: DataTypes.TINYINT.UNSIGNED, allowNull: false},
	ranked: {type: DataTypes.TINYINT, allowNull: false},
});

const beatmap_info = osu_beatmaps_mysql.define ('beatmap_info', {
	md5: {type: DataTypes.INTEGER,allowNull: false, unique: true, primaryKey: true},
	artist: {type: DataTypes.STRING, allowNull: false},
	title: {type: DataTypes.STRING, allowNull: false},
	creator: {type: DataTypes.STRING, allowNull: false},
	difficulty: {type: DataTypes.STRING, allowNull: false},
});

beatmaps_md5.hasOne(osu_beatmap_id, { foreignKey: 'md5', foreignKeyConstraints: false});
beatmaps_md5.hasOne(beatmap_info, { foreignKey: 'md5',  foreignKeyConstraints: false});

osu_beatmap_id.hasOne(beatmap_info, { foreignKey: 'md5',  foreignKeyConstraints: false});

const osu_score_legacy = osu_scores_mysql.define ('osu_score_legacy', {
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

const osu_score = osu_scores_mysql.define ('osu_score', {
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

const osu_user_grade = osu_scores_mysql.define ('osu_user_grade', {
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

/** 
* @param {Model} Model Execute model
* @param {Boolean} all If true get all fields, else get only non-primary keys or only primary keys
* @param {Boolean} primary If true get only primary keys, else get only non-primary keys
* @return {Array} Array of fields of Model
*/
const get_model_field_list = async ({ model, all = false, primary = false }) => {
	return await Promise.all(Object.entries(await model.describe())
		// eslint-disable-next-line no-unused-vars
		.filter( ([key, value]) => all ? true : primary ? value.primaryKey : !value.primaryKey )
		// eslint-disable-next-line no-unused-vars
		.map( ([key, value]) => key ));
};

const mysql_actions = [
	{ names: 'beatmaps_md5', model: beatmaps_md5 },
	{ names: 'beatmap_id', model: osu_beatmap_id },
	{ names: 'beatmap_info', model: beatmap_info },

	{ names: 'osu_score_legacy', model: osu_score_legacy },
	{ names: 'osu_score', model: osu_score },
	{ names: 'osu_user_grade', model: osu_user_grade },
];

const _this = module.exports = {
	mysql_actions,
    
	osu_beatmaps_mysql,
	osu_scores_mysql,

	beatmaps_md5,
	osu_beatmap_id,
	beatmap_info,

	osu_score,
	osu_score_legacy,
	osu_user_grade,

	check_connect: async () => {
		console.log('База данных', 'Проверка соединения');

		try {
			config_data = config.get_data();
			
			const connection = await createConnection(`mysql://${config_data.DB_USER}:${config_data.DB_PASSWORD}@${config_data.DB_HOST}:${config_data.DB_PORT}`);

			await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config_data.DB_NAME_BEATMAPS}\`;`);
			await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config_data.DB_NAME_SCORES}\`;`);

			return connection;

		} catch (e){
			console.error('проверьте правильность данных data\\config.json\n');
			
			Object.entries(config_data).forEach( ([key, val]) => !val? 
				console.log( `${key}: Ошибка: отсутствует значение\n`) : null );

			if (e.code === 'ECONNREFUSED' || e.name === 'SequelizeConnectionRefusedError'){
				console.error('База данных', 'ошибка соединения', 'Нет доступа к базе');
			} else {
				console.error('База данных', 'ошибка базы', e );
			}

			return false;
		}
	},

	prepareDB: async ( args ) => {
		const alter_db = args?.alter_db || false;
		
		console.log('База данных', 'Подготовка');
		
		if ( !(await _this.check_connect()) ){
			return false;
		}
		
		const sync_params = alter_db ? { alter: true } : { alter: false };

		await osu_beatmaps_mysql.sync( sync_params );
		await osu_scores_mysql.sync( sync_params );

		// eslint-disable-next-line no-unused-vars
		await Promise.all( _this.mysql_actions.map( async ({ names, model }, i, a) => {
			a[i].attributes = Object.entries(await a[i].model.describe()).map( ([name, attribute ]) => ({ name, attribute }) );
			a[i].fileds = await get_model_field_list({ model, all: true });
			a[i].keys = await get_model_field_list({ model, primary: true });
			a[i].non_keys = a[i].fileds.filter( v =>!a[i].keys.includes( v ) );
		}));
        
		console.log('База данных', 'Подготовка завершена');
		return true;
	},

	select_mysql_model: (action) => {

		const mysql_model = _this.mysql_actions.find ( model => {
			if (typeof model.names === 'string'){
				return model.names === action;
			} else if (typeof model.names === 'object') {
				return model.names.findIndex( val => val === action) > -1;
			} else {
				return undefined;
			}
		});
    
		if ( !mysql_model ){
			console.error(`DB: (select_mysql_model) undefined action: ${action}`);
			throw new Error('unknown mysql model', action);
		}
    
		return mysql_model.model;
	},

};