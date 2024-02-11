const colors = require('colors');
const { readdirSync, readFileSync, existsSync, writeFileSync } = require('fs');
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

    const list = [{}, {}, {}, {}];

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

            if (!list[mode][score.rank]){
                list[mode][score.rank] = [];
            }

            list[mode][score.rank].push(score.beatmap_id);

        } catch (e) {
            console.error(e);
        }
    }

    let output_data = `\nUser ${userid} beatmap list by grades\n`;

    console.log(output_data);

    for (let i in list){
        if (Object.keys(list[i]).length == 0){
            continue;
        }

        output_data += `\n[${gamemode[i]}]\n${
            Object.entries(list[i])
            .map( x => `\n [ ${x[0]} ]\n${x[1].join('\n')}`)
            .join('\n')
        }\n`;

        console.log(`\n[${gamemode[i].yellow}]\n${
            Object.entries(list[i])
            .map( x => `\n [ ${x[0].green} ]\n${x[1].join('\n')}`)
            .join('\n')
        }\n`);
    }
    const output_filename = `${userid}_beatmap_list_by_grade.txt`;
    writeFileSync( output_filename, output_data, { encoding: 'utf8' } );
    console.log('results saved in file', output_filename.yellow, '\n');
}