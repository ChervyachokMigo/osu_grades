const path = require('path');
const { writeFileSync } = require('fs');

const { csv_folder_path } = require('../const');
const { folder_prepare } = require('../tools/misc');

module.exports = (values = null, filename) => {
    console.log('saving csv');
    folder_prepare (csv_folder_path);

    if (!filename) {
        console.error('filename invalid');
        return false;
    }

    if (values && values.length > 0){
        let data = [];

        data.push( Object.keys(values[0]).map( x => `"${x}"` ).join(';') );

        for (let record of values){
            data.push( Object.values(record).map( x => typeof x === 'string'? `"${x}"` : x ).join(';') );
        }

        try {
            writeFileSync(path.join( csv_folder_path, filename), data.join('\r\n'), { encoding: 'utf8' });
        } catch (e) {
            console.error(e);
        }
    } else {
        console.error('save_csv > no values');
    }
}