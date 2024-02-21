const { writeFileSync } = require('fs');
const path = require('path');
const { csv_folder_path } = require('../../misc/const');

module.exports = {
	save_csv: (values, tablename) => {
		if (!tablename) {
			console.error('wrong tablename', tablename);
			return;
		}
		
		if (values.length > 0){
			const now = new Date();
			const filename =  `${tablename}-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

			let data = [];
            
			//make header
			data.push( Object.keys(values[0]).map( x => `"${x}"` ).join(';') );
    
            //make fields attributes
			data.push( get_fie );

			//make data
			for (let record of values){
				data.push( Object.values(record).map( x => typeof x === 'string'? `"${x}"` : x ).join(';') );
			}
            
			writeFileSync( path.join( csv_folder_path, filename + '.csv'), data.join('\r\n'), {encoding: 'utf8' });
		} else {
			console.error('warning! empty data csv');
		}
	}
};