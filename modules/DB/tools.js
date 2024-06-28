const { select_mysql_model, find_model } = require('MYSQL-tools');

module.exports = {
	get_md5_id: async ( hash ) => {
		if ( !hash || hash && typeof hash !== 'string' && hash.length !== 32 ){
			console.error( 'beatmap hash', hash );
			throw new Error( 'beatmap hash not valid' );
		}
        
		const beatmaps_md5 = select_mysql_model('beatmaps_md5');
		const result = await beatmaps_md5.findOrCreate({ 
			where: { hash },
			ignoreDuplicates: true,
			updateOnDuplicate: [ 'hash']
		});
	
		const res = result.shift().getDataValue('id');
		if (!res){
			console.error( 'beatmap_md5 error', result );
		}

		return res;
	},

	mods_v2_to_string: (mods) => mods && mods.length > 0 ? mods.map( x => x.acronym ).join('+') : 'No Mods',

	get_attributes_types: (tablename) => find_model(tablename)?.attributes.map( x => x.attribute.type)
};