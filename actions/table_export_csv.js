const input = require('input');
const { get_models_names, export_table_csv } = require('MYSQL-tools');
const { csv_folder_path } = require('../misc/const');

module.exports = {
	args: ['tablename'],
	action: async( args ) => {
		console.log('export table');

		const tables = get_models_names();
		
		await export_table_csv({
			folder_path: csv_folder_path,
			tablename: args.tablename || await input.select('Select table name', tables),
			string_quotes: await input.text('Enter string quotes', { default: '"' }),
			separator: await input.text('Enter separator', { default: ';' }),
		});
		
		console.log('export complete');
	}};