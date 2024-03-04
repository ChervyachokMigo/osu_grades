const { collection_db_load, collection_db_save } = require('osu-tools');
const path = require('path');

const { osu_path } = require('../data/config');
const { osu_score, beatmaps_md5 } = require('../modules/DB/defines');
const { group_by, get_ruleset_by_gamemode_int, get_key_by_value } = require('../tools/misc');
const { rank_to_int } = require('../misc/const');
const { copyFileSync, rmSync } = require('fs');
const users = require('../modules/DB/users');

			
module.exports = {
	args: [ 'output_path' ],

	// eslint-disable-next-line no-unused-vars
	action: async( args ) => {
		const old_collection_path = path.join( osu_path , 'collection.db' );
		const temp_collection_path = path.join( osu_path, 'temp_collection.db' );

		const backup_name = 'collection-' + 
			new Date().toISOString().replace(/[T.:]+/gui, '-').replace('Z', '') + 
			'.db.bak';
		const backup_path = path.join( osu_path, backup_name );
		copyFileSync( old_collection_path, backup_path  );

		let collections = collection_db_load( old_collection_path );

		await users.users_variants( 'checkboxes', async ( {userid, gamemode} ) => {
			const res = await osu_score.findAll({ 
				raw: true, 
				attributes: ['md5', 'rank', 'gamemode', 'userid'],	
				include: [ { model: beatmaps_md5 } ],

				fieldMap: {
					'beatmaps_md5.id': 'md5',
					'beatmaps_md5.hash': 'hash',
				},

				where: { 
					userid, 
					gamemode, 
					ranked: true, 
					best: true 
				},
			});

			const groupped = group_by( res, 'rank' );

			for ( const [rank, value] of Object.entries( groupped ) ){
				const collection_name = 
					`${userid}_` +
					`${get_ruleset_by_gamemode_int(gamemode).name}_` +
					`${get_key_by_value(rank_to_int, Number(rank))}_rank`;

				let i = collections.collections.findIndex ( x => x.name === collection_name );
				if (i == -1) {
					i = collections.collections.length;
				}
				
				collections.collections[i] = {
					name: collection_name,
					beatmaps_md5: value.map( x => x.hash )
				};

				console.log( 'add collection:', collection_name, collections.collections[i].beatmaps_md5.length );
			}
			
		});

		collection_db_save ( collections, temp_collection_path );

		copyFileSync ( temp_collection_path, old_collection_path );
		rmSync( temp_collection_path, { force: true } );

	}};
