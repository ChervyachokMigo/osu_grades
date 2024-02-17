const { save_all_json_scores } = require("../modules/DB/scores");
const { check_userid } = require("../tools/misc");

module.exports = async (args) => {
    console.log('saving scores to db');
    await save_all_json_scores();
}