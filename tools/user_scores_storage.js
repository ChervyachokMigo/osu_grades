const { writeFileSync, existsSync, readFileSync, readdirSync } = require('fs');

const { scores_storage_path } = require("../misc/const");
const load_osu_db = require("./load_osu_db");
const { check_userid } = require('./misc');

let scores_storage = [];

module.exports = {
    find: (userid, beatmap_md5, mode) => {
        let idx = scores_storage.findIndex( x => x.userid === userid);
        if (idx === -1)
            return false
        else
            return scores_storage[idx].scores.findIndex( x => x.beatmap_md5 === beatmap_md5 && x.mode === mode ) > -1;
    },

    load: () => {
        if ( existsSync(scores_storage_path) ){
            scores_storage = JSON.parse(readFileSync( scores_storage_path, { encoding: 'utf8' }));
        }
    },

    add: (arg_userid, score) => {
        const userid = check_userid(arg_userid);
        if (!userid) return;

        let idx = scores_storage.findIndex( x => x.userid === userid );
        if ( idx === -1 ) {
            idx = scores_storage.push({ userid, scores: [] }) - 1;
        }

        if (scores_storage[idx].scores.findIndex( x => x.beatmap_md5 === score.beatmap_md5) === -1){
            scores_storage[idx].scores.push(score);
            writeFileSync(scores_storage_path, JSON.stringify(scores_storage), { encoding: 'utf8' });
        }

    },

    add_all: (args) => {
        const userid = check_userid(args.shift());
        if (!userid) return;

        const gamemode = Number(args.shift()) || null;

        //get osu db data
        const osu_db = load_osu_db();
        if ( !osu_db ){
            console.error('[osu_db] > is not exists');
            return;
        }

        if ( existsSync(scores_storage_path) ){
            scores_storage = JSON.parse(readFileSync( scores_storage_path, { encoding: 'utf8' }));
        }

        let idx = scores_storage.findIndex( x => x.userid === userid );
        
        if ( idx === -1 ) {
            idx = scores_storage.push({ userid, scores: [] }) - 1;
        }

        console.log(scores_storage[idx].scores.length)

        const scores_in_db = osu_db.filter( x => gamemode ? x.gamemode_int === gamemode : true )
            .map( x => ({
                mode: x.gamemode_int,
                beatmap_id: x.beatmap_id,
                beatmap_md5: x.beatmap_md5
            }));

        const saved_scores = new Set(scores_storage[idx].scores.map( x => x.beatmap_md5));

        scores_storage[idx].scores = [
            ...scores_storage[idx].scores, 
            ...scores_in_db.filter( (v, i, a) => !saved_scores.has(v.beatmap_md5) )
        ];

        console.log(scores_storage[idx].scores.length)

        writeFileSync(scores_storage_path, JSON.stringify(scores_storage), { encoding: 'utf8' });
        
    }

}