// Lib Imports
const fetch         = require('node-fetch');
const _             = require('lodash');
// Custom Imports
const Config        = require('./../../utils/config');
const Log           = require('./../../utils/log');
const reqErrManager = require('./../../utils/riot/requestErrorsManager');
const updateTeam    = require('./../../utils/database/updateTeam');
// Logs
const LOGTAGS = ["SERVER", "TeamMatchHistory"];

// NOTES :
//  - This method returns a 'code' field in the response if all is fine.
//      The 'code' field can have different values :
//          - '0' : Flat data are returned in the 'result' field.
//          - '1' : DB is already updating, check the 'getUpdateStatus' to get more informations.
module.exports = function TeamsMatchHistory (req, res, mysql) {
    if(req.params.teamID)
        getLastUpdate(mysql, req.params.teamID, res, getHistory);
    else
        res.json({ status: "ko", error: "Unknown team." });
}

function getLastUpdate(mysql, teamID, res, callback) {
    var query = "SELECT `t`.`teamID`, `t`.`lastUpdate`, `t`.`isUpdating` FROM lolteam.`teams` AS `t` WHERE `t`.`id`=?;";
    mysql.query(query, [teamID], function(err, row, fields) {
        if (!err)
            callback(row[0], teamID, res, mysql);
        else {
            res.json({ status: "ko", error: "SQL Error" });
            Log(_.concat(LOGTAGS, "MYSQL"), err);
        }
    });
}

// NOTES :
//  - We can get 'Undefined' for `teams`.`lastUpdate`. It means that the database value is 'NULL'.
function getHistory(row, teamID, res, mysql) {
    var shouldUpdate = false;
    if(typeof(row.teamID) !== "undefined" && typeof(row.lastUpdate) !== "undefined" && typeof(row.isUpdating) !== "undefined") {
        // 7200000 = 1000*60*60*2 => Number of milliseconds in 2 hours (To compare with GMT based time in db)
        if((row.lastUpdate == null || (Date.now() - new Date(row.lastUpdate)) > 1000*60*60*2) && row.isUpdating == 0)
            shouldUpdate = true;

        if(shouldUpdate){
            var url = Config.RIOT.API.TEAM.getFullURL(row.teamID);
            if(url != null) 
                pushRequest(url, teamID, res, mysql);
        }
        else {
            if(row.isUpdating == 1)
                res.json({ status: "ok", message: "The system is already updating your team's data.", code: 1 });
            else
                res.json({ status: "ok", message: "Your team's data are up to date.", code: 2 });
        }
    }
    else {
        res.json({ status: "ko", error: "Invalid MySQL response" });
        Log(_.concat(LOGTAGS, "MYSQL"), "Invalid MySQL response");
    }
}

function pushRequest(url, teamID, res, mysql) {
    Config.RIOT.REQUEST.push(url, function(err, fetchRes) {
        if(!err && fetchRes){
            var result = (fetchRes.result ? fetchRes.result : fetchRes);
            new updateTeam(result, teamID, mysql, function(){
                res.json({ status: fetchRes.status, result: result, code: 0 });
            });
        }
        else
            reqErrManager("TeamMatchHistory", {url: url, res: res}, err, function(req, res){
                pushRequest(req, teamID, res, mysql);
            });
    });
}