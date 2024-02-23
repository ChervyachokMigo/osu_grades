const fs = require('fs');
const input = require('input');

const { MYSQL_SAVE } = require('./base.js');
const { split_array_on_chunks, print_processed } = require('../../tools/misc.js');
const { prepareDB } = require('./defines.js');


const strict = true;

const _this = module.exports = {
	load_csv: async ({ filepath, skip_errors = false, delimiter = ';'}) => {

		let errors_count = 0;
		let errors = [];

		if ( !fs.existsSync(filepath)){
			throw new Error('no csv file at '+filepath);
		}
		try{

			const data = fs.readFileSync( filepath, {encoding: 'utf8'}).split('\n')
				// eslint-disable-next-line no-irregular-whitespace
				.map( x => !x ? x : x.replace( /["\r﻿]/gi, '' )).filter(x => x!== null);

			const data_splitted = Array.from(new Set(data)).map( x => x.split(delimiter));

			const header = data_splitted.shift();
			const types = data_splitted.shift();

			// parse content
			const content = data_splitted.map ( (x, k) => {
				
				if (x.length !== types.length){
					

					if (strict){
						console.error( ` > row ${k} error: ${data_splitted[k].join(delimiter)}` );
						//console.error('rows', x);
						errors.push({ num: k, values: x });
						errors_count++;
					}
					
					return null;
				}

				return x.map ( (y, i) => {

					if (types[i]?.startsWith('INT') || types[i]?.startsWith('FLOAT') || types[i]?.startsWith('TINYINT')) {
						return isNaN(y)? y: Number(y);
					} else {
						//if (types[i].startsWith('VARCHAR')
						return y;
					}

				});

			}).filter( x => x!== null );

			let approved_errors = [];

			// manual fix errors
			if (!skip_errors && errors_count > 0){
				console.log('Errors count:', errors_count);


				while ( errors.length > 0 ) {

					console.log( `осталось ${errors.length} ошибок из ${errors_count}` );

					let error = errors.shift();

					while (error.values.length !== types.length){
					
						let res = await input.select( 
							`Error string (${error.num}): ${data_splitted[error.num].join(delimiter)}\n${error.values.map( (x, i)  => `[${i}]: ${x}`).join('\n')}`,
							error.values.map( (x, i, a)  => 
								i < a.length -1
									? {name:`compare ${i} with ${Number(i)+1}`, value: i }
									: null).filter( x => x!== null)
						);

						error.values[res] = error.values[res] + delimiter + error.values[res + 1];
						error.values.splice(res + 1, 1);

					}
					
					const yes = await input.confirm( 
						`Продолжить?\n${error.values.map( (x, i)  => `[${i}]: ${x}`).join('\n')}`, {default: true} );
					if (yes) {
						approved_errors.push( error );
					}

				}

			}

			return [ ...approved_errors.map( x => x.values), ...content]
				.map( x => Object.fromEntries( x.map( (y, i) => [header[i], y] ) ));

		} catch (e){
			throw new Error(e);
		}
	},

	import_table_csv: async ({ filepath, tablename, chunk_size = 500, skip_errors = false, delimiter = ';'}) => {
		await prepareDB();

		const content_objects = await _this.load_csv({ filepath, skip_errors, delimiter });

		const chunks = split_array_on_chunks( content_objects, chunk_size);

		let count = 0;

		for (let chunk of chunks){
			count += chunk.length;
			await MYSQL_SAVE(tablename, 0, chunk);
			print_processed({
				current: count, 
				size: chunks.length * chunk_size, 
				initial: chunk.length, 
				frequency: 100, 
				name: tablename
			});
		}
		
	},
};