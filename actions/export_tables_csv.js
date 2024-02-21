const input = require('input');
const fs = require('fs');
const path = require('path');


const { import_table_csv } = require('../modules/DB/mysql_import');
const { csv_folder_path } = require('../misc/const');
const { mysql_actions } = require('../modules/DB/defines');

module.exports = {
	args: ['filepath', 'tablename'],
	action: async( args ) => {
		console.log('importing table');

		const files = fs.readdirSync( csv_folder_path );
		const tables = mysql_actions.map( x => x.names );

		await import_table_csv( 
			args.filepath || path.join( csv_folder_path, await input.select('Select csv file', files )), 
			args.tablename || await input.select('Select table name', tables),
		);
		
		console.log('import complete');
	}};