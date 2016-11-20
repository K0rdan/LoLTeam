// Lib Imports
const fetch  = require('node-fetch');
const _      = require('lodash');
// Custom Imports
const Config = require('./../../utils/config');
const Log    = require('./../../utils/log');
// Logs
const LOGTAGS = ["SERVER", "TeamsList"];

module.exports = function TeamsList (req, res, mysql) {
    if(req.cookies.lt_user || req.params.userID){
        var userID = null;
        // Priority on the params
        if(req.params.userID)
            userID = req.params.userID;
        // If no param
        if(userID == null && req.cookies.lt_user)
            userID = req.cookies.lt_user.id;

        if(userID != null) {
            var query = "SELECT `t`.* FROM lolteam.`teams` AS `t` JOIN lolteam.`user_teams` AS `ut` ON `ut`.`teamID` = `t`.`id` WHERE `ut`.`userID`=?;";
            mysql.query(query, [userID], function(err, row, fields) {
                if (!err)
                    res.json({ status: "ok", result: row });
                else {
                    res.json({ status: "ko", error: "SQL Error" });
                    Log(_.concat(LOGTAGS, "MYSQL"), err);
                }
            });
        }
    }
    else
        res.json({ status: "ko", error: "Unknown user." });
}