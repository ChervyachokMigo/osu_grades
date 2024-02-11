
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