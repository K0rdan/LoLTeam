// Lib Imports
const _      = require('lodash');
// Custom Imports
const Log    = require('./../log');
// Logs
const LOGTAGS = ["SERVER", "SaveGame"];

module.exports = function updateTeam (data, teamID, mysql, callback) {
    console.log(arguments);

    var teamData = data[0];
    var wins = teamData.teamStatDetails[0].wins, losses = teamData.teamStatDetails[0].losses;

    var query = "UPDATE lolteam.`teams` SET `wins`=?, `looses`=? WHERE id=?";
    mysql.query(query, [wins, losses, teamID], function(err, row, fields) {
        if (!err)
            callback();
        else
            callback();
    });
}