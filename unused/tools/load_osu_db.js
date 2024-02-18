const { readFileSync, existsSync } = require('fs');
const { osu_db_parsed_path } = require('../../misc/const');

module.exports = () => {
    if ( existsSync(osu_db_parsed_path) === false){
        console.error('file not exists:', osu_db_parsed_path);
        return null;
    }
    try {
        console.log('loading parsed db', osu_db_parsed_path);
        const data = readFileSync( osu_db_parsed_path, { encoding: 'utf8' });
        return JSON.parse(data);
    } catch (e) {
        console.error(e);
        return null;
    }
}