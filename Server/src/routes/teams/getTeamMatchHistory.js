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
    // 'Undefined' means that the database value is 'NULL'
    if(typeof(lastUpdate) == "undefined") {

    }
}