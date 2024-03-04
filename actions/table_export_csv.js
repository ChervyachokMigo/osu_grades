const input = require('input');
const { export_table_csv } = require('../modules/DB/mysql_export');
const { mysql_actions } = require('../modules/DB/defines');

module.exports = {
	args: ['tablename'],
	action: async( args ) => {
		console.log('export table');

		const tables = mysql_actions.map( x => x.names );

		await export_table_csv( 
			args.tablename || await input.select('Select table name', tables),
			await input.text('Enter string quotes', { default: '"' }),
			await input.text('Enter separator', { default: ';' }),
		);
		
		console.log('export complete');
	}};