const { gamemode } = require("./const");

module.exports = {
    found_X_scores_beatmap: ({ length, userid, beatmap }) =>
        `found ${length} scores of beatmap ${beatmap.md5} for user ${userid} with gamemode ${gamemode[beatmap.gamemode_int]}`,

    found_new_X_scores_beatmap: ({ length, beatmap, userid }) =>
        `found new ${length} scores of beatmap ${beatmap.md5} for user ${userid} with gamemode ${gamemode[beatmap.gamemode_int]}`,

    found_X_scores_gamemode: ({ length, userid, gamemode_int }) =>
        `found ${length} scores for user ${userid} with gamemode ${gamemode[gamemode_int]}`,
        
    found_new_X_scores_gamemode: ({ length, userid, gamemode_int }) =>
        `found new ${length} scores for user ${userid} with gamemode ${gamemode[gamemode_int]}`,
}