const { beatmaps_md5 } = require("./defines");

module.exports = {
    get_md5_id: async ( hash ) => {
        if ( !hash || hash && typeof hash !== 'string' && hash.length !== 32 ){
            console.error( 'beatmap hash', hash )
            throw new Error( 'beatmap hash not valid' );
        }
        
        const result = await beatmaps_md5.findOrCreate({ 
            where: { hash },
            logging: false,
        });
    
        return result.shift().getDataValue('id');
    },

    mods_v2_to_string: (mods) => mods ? mods.map( x => x.acronym ).join('+') : 'No Mods',

}