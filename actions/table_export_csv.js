const input = require('input');
const { get_models_names } = require('MYSQL-tools');
const { export_table_csv } = require('../modules/DB/mysql_export');

module.exports = {
	args: ['tablename'],
	action: async( args ) => {
		console.log('export table');

		const tables = get_models_names();

		await export_table_csv( 
			args.tablename || await input.select('Select table name', tables),
			await input.text('Enter string quotes', { default: '"' }),
			await input.text('Enter separator', { default: ';' }),
		);
		
		console.log('export complete');
	}};