// Lib Imports
const fetch  = require('node-fetch');
const _      = require('lodash');
// Custom Imports
const Config = require('./../../utils/config');
const Log    = require('./../../utils/log');
// Logs
const LOGTAGS = ["SERVER", "TeamMatchHistory"];

module.exports = function TeamsMatchHistory (req, res, mysql) {
    if(req.params.teamID){
        getLastUpdate(mysql, req.params.teamID, getHistory);
    }
    else
        res.json({ status: "ko", error: "Unknown team." });
}

function getLastUpdate(mysql, teamID, callback) {
    var query = "SELECT `t`.`lastUpdate` FROM lolteam.`teams` AS `t` WHERE `t`.`id`=?;";
    mysql.query(query, [teamID], function(err, row, fields) {
        if (!err)
            callback(row[0]);
        else {
            res.json({ status: "ko", error: "SQL Error" });
            Log(_.concat(LOGTAGS, "MYSQL"), err);
        }
    });
}

function getHistory(lastUpdate) {
    // https://euw.api.pvp.net/api/lol/euw/v2.4/team/TEAM-e59df190-3e2e-11e6-b377-c81f66dd7106?api_key=RGAPI-321bbf82-47ba-4a0b-b91e-f63819443de5
    var 
    // 'Undefined' means that the database value is 'NULL'
    if(typeof(lastUpdate) == "undefined") {

    }
}