const { beatmaps_md5 } = require("./defines");

module.exports = {
    get_md5_id: async ( hash ) => {
        if (hash && typeof hash !== 'string' && hash.length !== 32){
            return null;
        }
    
        const result = await beatmaps_md5.findOrCreate({ 
            where: { hash },
            logging: false
        });
    
        return result[0].getDataValue('id');
    },

    mods_v2_to_string: (mods) => mods ? mods.map( x => x.acronym ).join('+') : 'No Mods',

}