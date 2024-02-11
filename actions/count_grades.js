const { readdirSync, readFileSync, existsSync } = require('fs');
const path = require('path');

const { scores_folder_path } = require('../const');
const { gamemode } = require('../tools/misc');

module.exports = (args) => {
    console.log('counting grades');
    //check userid
    const userid = Number(args.shift()) || null;
    if (!userid || isNaN(userid) || userid == 0){
        console.error('userid invalid:', userid);
        return;
    }

    const scores_userdata_path = path.join(scores_folder_path, userid.toString());
    if (!existsSync(scores_userdata_path)) {
        console.error(`user ${userid} was not scanned`);
        return;
    }

    const grades = [{}, {}, {}, {}];

    const files = readdirSync(scores_userdata_path, { encoding: 'utf8' });

    for (let filename of files){
        try {
            let scores = JSON.parse(readFileSync(path.join(scores_userdata_path, filename), { encoding: 'utf8' }))

            if (!scores || scores.length === 0){
                console.error('warning:', filename, 'not contains scores');
                continue;
            }

            scores.sort( (a, b) => a.total_score - b.total_score);

            const score = scores.shift();

            const mode = Number(score.ruleset_id);

            grades[mode][score.rank] = 
                    grades[mode][score.rank] ? 
                    grades[mode][score.rank] + 1 : 
                    1

        } catch (e) {
            console.error(e);
        }
    }

    const grades_sort = grades.map( x => Object.entries(x)
        .sort(([,a],[,b]) => b - a)
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {}) );

    console.log('User', userid, 'grades');
    for (let i in grades_sort){
        console.log(`[${gamemode[i]}]\n${
            Object.entries(grades_sort[i])
            .map( x => ' ' + x.join(': '))
            .join('\n')
        }\n`);
    }

}