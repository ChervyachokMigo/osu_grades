const { ModsIntToShortText } = require('osu-tools');

const { MYSQL_SAVE } = require("../modules/DB/base");
const { prepareDB,  osu_score_legacy } = require("../modules/DB/defines");

(async()=> {
    await prepareDB();
    const scores_db = (await osu_score_legacy.findAll({ 
        where: {}, 
        logging: false, 
        raw: true
    })).map( x => ({...x, 
        mods: ModsIntToShortText(x.mods).join('+')  }));

    console.log('scores', scores_db.length, 'records');
    
    for (let score of scores_db) {
        await MYSQL_SAVE('osu_score_legacy', {id: score.id, md5: score.md5}, score);
    }
    console.log('complete');

})();
