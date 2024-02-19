const { createConnection } = require('mysql2/promise');
const { Sequelize, DataTypes } = require('@sequelize/core');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME_BEATMAPS, DB_NAME_SCORES } = require("../../data/config.js");

const osu_beatmaps_mysql = new Sequelize( DB_NAME_BEATMAPS, DB_USER, DB_PASSWORD, { 
    dialect: `mysql`,
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
    hash: {type: DataTypes.STRING(32),  defaultvalue: '', allowNull: false, unique: true, index: true},
});

const osu_beatmap_id = osu_beatmaps_mysql.define ('beatmap_id', {
    md5: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false, unique: true, primaryKey: true},
    beatmap_id: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false},
    beatmapset_id: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false},
    gamemode: {type: DataTypes.TINYINT.UNSIGNED,  defaultvalue: '', allowNull: false},
    ranked: {type: DataTypes.TINYINT,  defaultvalue: 0, allowNull: false},
}, {noPrimaryKey: false});

const beatmap_info = osu_beatmaps_mysql.define ('beatmap_info', {
    md5: {type: DataTypes.INTEGER,  defaultvalue: 0, allowNull: false, unique: true, primaryKey: true},
    artist: {type: DataTypes.STRING,  defaultvalue: '', allowNull: false},
    title: {type: DataTypes.STRING,  defaultvalue: '', allowNull: false},
    creator: {type: DataTypes.STRING,  defaultvalue: '', allowNull: false},
    difficulty: {type: DataTypes.STRING,  defaultvalue: '', allowNull: false},
}, {noPrimaryKey: false});

beatmaps_md5.hasOne(osu_beatmap_id, { foreignKey: 'md5', foreignKeyConstraints: false});
beatmaps_md5.hasOne(beatmap_info, { foreignKey: 'md5',  foreignKeyConstraints: false});

osu_beatmap_id.hasOne(beatmap_info, { foreignKey: 'md5',  foreignKeyConstraints: false});

const osu_scores_mysql = new Sequelize( DB_NAME_SCORES, DB_USER, DB_PASSWORD, { 
    dialect: `mysql`,
    define: {
        updatedAt: false,
        createdAt: false,
        deletedAt: false
    },
});

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
}, { noPrimaryKey: false });

const osu_user_grade = osu_scores_mysql.define ('osu_user_grade', {
    userid: {type: DataTypes.INTEGER, allowNull: false, key: 'user', unique: 'user'},
    gamemode: {type: DataTypes.TINYINT, allowNull: false, key: 'user', unique: 'user'},
    score_type: {type: DataTypes.TINYINT, allowNull: false, key: 'user', unique: 'user'},
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

const mysql_actions = [
    { names: 'beatmaps_md5', model: beatmaps_md5 },
    { names: 'beatmap_id', model: osu_beatmap_id },
    { names: 'beatmap_info', model: beatmap_info },

    { names: 'osu_score_legacy', model: osu_score_legacy },
    { names: 'osu_score', model: osu_score },
    { names: 'osu_user_grade', model: osu_user_grade }
];

module.exports = {
    mysql_actions,
    
    osu_beatmaps_mysql,
    osu_scores_mysql,

    beatmaps_md5,
    osu_beatmap_id,
    beatmap_info,

    osu_score,
    osu_score_legacy,
    osu_user_grade,

    prepareDB: async () => {
        console.log('База данных', 'Подготовка');
        try {
            const connection = await createConnection(`mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`);
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME_BEATMAPS}\`;`);
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME_SCORES}\`;`);
        } catch (e){
            if (e.code === 'ECONNREFUSED' || e.name === `SequelizeConnectionRefusedError`){
                throw new Error('Нет доступа к базе');
            } else {
                throw new Error(`ошибка базы: ${e}`);
            }
        }
        await osu_beatmaps_mysql.sync({ logging: false });
        await osu_scores_mysql.sync({ logging: false });
        
        console.log('База данных', `Подготовка завершена`);
    },

    select_mysql_model: (action) => {

        const MysqlModel = mysql_actions.find ( model => {
            if (typeof model.names === 'string'){
                return model.names === action;
            } else if (typeof model.names === 'object') {
                return model.names.findIndex( val => val === action) > -1;
            } else {
                return undefined;
            }
        });
    
        if (!MysqlModel){
            console.error(`DB: (selectMysqlModel) undefined action: ${action}`);
            throw new Error('unknown mysql model', action);
        }
    
        return MysqlModel.model;
    },

}