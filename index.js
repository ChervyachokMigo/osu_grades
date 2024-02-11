const {osu_db_load, beatmap_property, RankedStatus } = require('osu-tools');

const path = require('path');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('fs');

const {osuPath, login, password} = require('./config.js');
const { argv, env } = require('process');
const { auth, v2 } = require('osu-api-extended');


const osu_db_path = path.join(osuPath, 'osu!.db')
const osu_db_parsed_path = path.join('data', 'osu.db.json');
const csv_path = path.join('data', 'csv');

const nnaoi_id = 5275518;

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

const parse_osu_db = () => {
    console.log('parsing osu.db...');
    const results = osu_db_load( osu_db_path, beatmap_props );
    writeFileSync( osu_db_parsed_path, JSON.stringify(results.beatmaps), { encoding: 'utf8' });
    console.log('writed', results.beatmaps.length,'beatmap records');
}

const make_csv_string = (data) => {

}

const save_csv = (values, filename) => {
    if (values.length > 0){
        let data = [];

        data.push( Object.keys(values[0]).map( x => `"${x}"` ).join(';') );

        for (let record of values){
            data.push( Object.values(record).map( x => typeof x === 'string'? `"${x}"` : x ).join(';') );
        }
        
        writeFileSync(path.join( csv_path, filename), data.join('\r\n'), {encoding: 'utf8'});
    }
}

const load_csv = (filepath) => {
    if ( !fs.existsSync(filepath)){
        throw new Error('no csv file at '+filepath);
    }

    const data = fs.readFileSync( filepath, {encoding: 'utf8'}).split('\n')
        .map( x => x.replace(/["\r﻿]/gi,'').split(';') );
    const header = data.shift();
    const content = data.map ( x => x.map ( y => isNaN(y)? y: Number(y)) );
    return content.map( x => Object.fromEntries( x.map( (y, i) => [header[i], y] ) ));
}

const import_table_csv = async (filepath, tablename, chunk_size = 500) => {
    await prepareDB();

    const content_objects = load_csv(filepath);

    for (let chunk of splitArray( content_objects, chunk_size) ){
        await MYSQL_SAVE(tablename, 0, chunk)
    }
}

const export_osu_beatmap_pp_csv = async () => {
    await prepareDB();

    for (let {acc, mods}  of actions(false)){
        
        const mods_int = ModsToInt(mods);

        console.log('exporting >', 'osu_beatmap_pp','acc:', acc, 'mods:', mods_int);

        const mysql_values = await MYSQL_GET_ALL( 'osu_beatmap_pp', { mods: mods_int, accuracy: Number(acc) });
        
        save_csv(mysql_values, `osu_beatmap_pp_${acc}_${mods_int}.csv`);
        
    }

    console.log('export complete.');
}

const export_any_table_csv = async (tablename) => {
    if (!tablename){
        throw new Error('no tablename')
    }
    
    await prepareDB();

    console.log('exporting >', tablename);

    const mysql_values = await MYSQL_GET_ALL( tablename );
    
    save_csv(mysql_values, `${tablename}.csv`);

    console.log('export complete.');
}

let osu_db = null;

const load_osu_db = () => {
    osu_db = JSON.parse(readFileSync(osu_db_parsed_path, {encoding: 'utf8'}));
}

const folder_prepare = (path) =>{
    try{
        if (!existsSync(path)) {
            mkdirSync(path, {recursive: true}); 
        }
        return true
    } catch (e){
        console.log(`Cannot create folder: ${path}`)
        console.log(e);
        return false
    }
}

if (argv.slice(2).shift() === 'parse') {
    parse_osu_db();
}

if (argv.slice(2).shift() === 'save_csv') {
    load_osu_db();
    if (osu_db) {
        console.log(osu_db[0]);
        save_csv(osu_db.map( v => { return {
            md5: v.beatmap_md5, set_id: v.beatmapset_id, id: v.beatmap_id, mode: v.gamemode_int, status: v.ranked_status_int
        }}), 'beatmap_ids.csv');
    }
}

if (argv.slice(2).shift() === 'get_scores') {
    (async() => {
        load_osu_db();
        await auth.login_lazer( login, password );

        if (!osu_db){
            return;
        }
        
        const scores_data_path = path.join('data', 'scores', nnaoi_id.toString());

        folder_prepare(scores_data_path);

        let i = 0;

        const continue_md5 = 'ee6b7efa5f69c1995557c4fb95fe9abb';
        let is_continue = true;

        for (let v of osu_db){

            const beatmap = {md5: v.beatmap_md5, set_id: v.beatmapset_id, id: v.beatmap_id, mode: v.gamemode_int, status: v.ranked_status_int };
            i++;
            
            if (is_continue){
                if (beatmap.md5 === continue_md5) {
                    is_continue = false;
                    console.log('continue from', continue_md5);
                    console.log(i/osu_db.length*100, '%');
                } else {
                    continue;
                }
            }

            if (i % 1000 == 0) {
                console.log(i/osu_db.length*100, '%');
            }

            const condition = beatmap.status === RankedStatus.ranked && beatmap.id > 0;
            const output_name = beatmap.md5 + '.json';
            const output_path = path.join(scores_data_path, output_name);

            if (condition){
                try {
                    const data = await v2.scores.user.beatmap(beatmap.id, nnaoi_id, {best_only: false});

                    if (!data || data.length == 0){
                        continue;
                    }
                    //console.log(data)
                    writeFileSync(output_path, JSON.stringify(data), {encoding: 'utf8'});
                } catch (e) {
                    console.log( output_path, beatmap);
                    console.error(e);
                    break;
                }
                
            }

        }
    })();
}


