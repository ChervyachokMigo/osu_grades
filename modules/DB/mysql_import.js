const fs = require('fs');

const { MYSQL_SAVE } = require('./base.js');
const { split_array_on_chunks, print_processed } = require('../../tools/misc.js');
const { prepareDB } = require('./defines.js');

const _this = module.exports = {
	load_csv: (filepath) => {
		if ( !fs.existsSync(filepath)){
			throw new Error('no csv file at '+filepath);
		}
		try{
			const data = fs.readFileSync( filepath, {encoding: 'utf8'}).split('\n')
			// eslint-disable-next-line no-irregular-whitespace
				.map( x => x.replace(/["\r﻿]/gi,'').split(';') );
			const header = data.shift();
			const content = data.map ( x => x.map ( y => isNaN(y)? y: Number(y)) );
			return content.map( x => Object.fromEntries( x.map( (y, i) => [header[i], y] ) ));
		} catch (e){
			throw new Error(e);
		}
	},

	import_table_csv: async ( filepath, tablename, chunk_size = 500 ) => {
		await prepareDB();

		const content_objects = _this.load_csv(filepath);
		const chunks = split_array_on_chunks( content_objects, chunk_size);

		let count = 0;

		for (let chunk of chunks){
			count += chunk.length;
			await MYSQL_SAVE(tablename, 0, chunk);
			print_processed({
				current: count, 
				size: chunks.length, 
				initial: count, 
				frequency: 100, 
				name: tablename
			});
		}
		
	},
};