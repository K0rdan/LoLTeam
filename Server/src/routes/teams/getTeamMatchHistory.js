// Lib Imports
const fetch  = require('node-fetch');
const _      = require('lodash');
// Custom Imports
const Config = require('./../../utils/config');
const Log    = require('./../../utils/log');
// Logs
const LOGTAGS = ["SERVER", "TeamMatchHistory"];

// NOTES :
//  - This method returns a 'code' field in the response if all is fine.
//      The 'code' field can have different values :
//          - '0' : Flat data are returned in the 'result' field.
//          - '1' : DB is already updating, check the 'getUpdateStatus' to get more informations.
module.exports = function TeamsMatchHistory (req, res, mysql) {
    if(req.params.teamID)
        getLastUpdate(mysql, req.params.teamID, getHistory);
    else
        res.json({ status: "ko", error: "Unknown team." });
}

function getLastUpdate(mysql, teamID, callback) {
    var query = "SELECT `t`.`lastUpdate`, `t`.`isUpdating` FROM lolteam.`teams` AS `t` WHERE `t`.`id`=?;";
    mysql.query(query, [teamID], function(err, row, fields) {
        if (!err)
            callback(row[0]);
        else {
            res.json({ status: "ko", error: "SQL Error" });
            Log(_.concat(LOGTAGS, "MYSQL"), err);
        }
    });
}

// NOTES :
//  - We can get 'Undefined' for `teams`.`lastUpdate`. It means that the database value is 'NULL'.
function getHistory(row) {
    var shouldUpdate = false;
    
    if(row["lastUpdate"] && row["isUpdating"]) {
        if(row["lastUpdate"] == null && row["isUpdating"] == 0)
            shouldUpdate = true;

        if(shouldUpdate){
            // TODO : Update data
        }
        else
            res.json({ status: "ok", message: "The system is already updating your team's data.", code: "1" });
    }
    else {
        res.json({ status: "ko", error: "Invalid MySQL response" });
        Log(_.concat(LOGTAGS, "MYSQL"), "Invalid MySQL response");
    }
}