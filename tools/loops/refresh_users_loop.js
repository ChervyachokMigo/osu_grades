const osu_auth = require('../osu_auth');
const { check_gamemode, check_userid } = require('../misc');

module.exports = async({ args, looping = false , score_mode, limit = 100, init = async () => false, callback }) => {
	//check userid
	const userid = check_userid( args.userid );
	if (!userid) return;

	//check gamemode
	const ruleset = check_gamemode( args.gamemode );

	await init( userid );

	if ( score_mode > 1 ){
		console.log( 'authing to osu' );
		await osu_auth();
	}

	//start process
	console.log( 'updating scores' );

	const loop = {
		receiving: true,
		offset: 0,
	};

	while ( loop.receiving ) {

		const res = await callback({ userid, ruleset, offset: loop.offset, limit });

		if ( !res || res < limit || !looping )
			loop.receiving = false;
		else 
			loop.offset += limit;

	}

};
