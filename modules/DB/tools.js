const { beatmaps_md5, mysql_actions } = require("./defines");

module.exports = {
    get_md5_id: async ( hash ) => {
        if ( !hash || hash && typeof hash !== 'string' && hash.length !== 32 ){
            console.error( 'beatmap hash', hash )
            throw new Error( 'beatmap hash not valid' );
        }
        
        const result = await beatmaps_md5.findOrCreate({ 
            where: { hash },
            logging: false,
            ignoreDuplicates: true,
        });
    
        return result.shift().getDataValue('id');
    },

    get_model_fields: ( model_name, fields_name ) => {
        return mysql_actions.find( x => x.names === model_name )[fields_name];
    },

    mods_v2_to_string: (mods) => mods && mods.length > 0 ? mods.map( x => x.acronym ).join('+') : 'No Mods',

}