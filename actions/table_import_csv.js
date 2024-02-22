const input = require('input');
const fs = require('fs');
const path = require('path');


const { import_table_csv } = require('../modules/DB/mysql_import');
const { csv_folder_path } = require('../misc/const');
const { mysql_actions } = require('../modules/DB/defines');
const { boolean_from_string } = require('../tools/misc');

module.exports = {
	args: ['filepath', 'tablename', 'skip_errors', 'delimiter', 'strings_quotes' ],
	action: async( args ) => {
		console.log('importing csv');

		const files = fs.readdirSync( csv_folder_path );
		const tables = mysql_actions.map( x => x.names );

		await import_table_csv({
			filepath: args.filepath || path.join( csv_folder_path, await input.select('Select csv file', files )), 
			tablename: args.tablename || await input.select('Select table name', tables),
			skip_errors: boolean_from_string(args.skip_errors) || false, 
			delimiter: args.delimiter || ';',
			strings_quotes: args.strings_quotes || '"',
		});
		
		console.log('import complete');
	}};