const input = require('input');
const fs = require('fs');
const path = require('path');
const { get_models_names, import_table_csv } = require('MYSQL-tools');

//const { import_table_csv } = require('../modules/DB/mysql_import');
const { csv_folder_path } = require('../misc/const');
const { folder_prepare } = require('../tools/misc');

module.exports = {
	args: ['filepath', 'tablename', 'skip_errors', 'strings_quotes' ],
	action: async( args ) => {
		console.log('importing csv');
		folder_prepare( csv_folder_path );
		
		const files = fs.readdirSync( csv_folder_path );
		const tables = get_models_names();

		await import_table_csv(
			args.filepath || path.join( csv_folder_path, await input.select('Select csv file', files )), 
			args.tablename || await input.select('Select table name', tables),
		);
		
		console.log('import complete');
	}};