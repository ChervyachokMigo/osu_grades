const path = require('path');
const { csv_folder_path } = require('../../misc/const');
const { spawnSync } = require('child_process');
const { MYSQL_GET_ALL } = require('./base');
const { prepareDB } = require('./defines');
const { writeFileSync } = require('fs');

const save_csv = (values, filename) => {
	if (values.length > 0){
		let data = [];

		data.push( Object.keys(values[0]).map( x => `"${x}"` ).join(';') );

		for (let record of values){
			data.push( Object.values(record).map( x => typeof x === 'string'? `"${x}"` : x ).join(';') );
		}
        
		writeFileSync(path.join( csv_folder_path, filename), data.join('\r\n'), {encoding: 'utf8'});
	}
};

const export_any_table_csv = async (tablename) => {
	if (!tablename){
		throw new Error('no tablename');
	}
    
	await prepareDB();

	console.log('exporting >', tablename);

	const mysql_values = await MYSQL_GET_ALL( tablename );
    
	save_csv(mysql_values, `${tablename}.csv`);

	console.log('export complete.');
};

const pack = async (tablename = 'mysql_backups') => {

	const now = new Date();

	const filename =  `${tablename}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.7z`;
	const archive_name = path.join(csv_folder_path, filename);
	const files_pattern = path.join(csv_folder_path, '\\', '*.csv');

	console.log('creating archive csv files:', filename);

	const exe = 'bin/7z.exe';
	const args = [ 
		'a',    //add files
		'-y',   //assume yes
		'-mx9', //compression level
		archive_name,
		files_pattern
	];
	const {stdout, stderr} = spawnSync(exe, args, {encoding: 'utf8'});

	console.log(stdout, stderr);
};

module.exports = {
	export_any_table_csv,
	export_osu_beatmap_pp_csv,
	pack,
};
