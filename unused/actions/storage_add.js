
const user_scores_storage = require('../tools/user_scores_storage');

module.exports = async( args ) => {

    user_scores_storage.add_all( args );

}