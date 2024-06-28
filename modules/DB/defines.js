
const { prepareDB, prepareEND, beatmaps_prepare, scores_prepare } = require('MYSQL-tools');

const config = require('../../modules/config_control.js');


module.exports = {

	prepareDB: async () => {

		try {
			
			const config_data = config.get_data();
			const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME_BEATMAPS, DB_NAME_SCORES } = config_data;

			const connections = await prepareDB({
				DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DATABASES: { DB_NAME_BEATMAPS, DB_NAME_SCORES }
			});

			const osu_beatmaps_connection = connections.find( x=> x.name === DB_NAME_BEATMAPS )?.connection;
			const osu_scores_connection = 	connections.find( x=> x.name === DB_NAME_SCORES )?.connection;

			if (!osu_beatmaps_connection) {
				throw new Error('osu_beatmaps_connection connection undefined');
			}

			if (!osu_scores_connection) {
				throw new Error('osu_scores_connection connection undefined');
			}

			beatmaps_prepare(osu_beatmaps_connection);
			scores_prepare(osu_scores_connection, osu_beatmaps_connection);
			
			await prepareEND();

		} catch (e) {
			console.error(e);
			throw new Error(e);
		}

		return true;

	}
}