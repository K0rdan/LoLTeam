// Lib Imports
const _             = require('lodash');
const async         = require('async');
const fetch         = require('node-fetch');
// Custom Imports
const Config        = require('./../../utils/config');
const Log           = require('./../../utils/log');
const reqErrManager = require('./../../utils/riot/requestErrorsManager');
const updateTeam    = require('./../../utils/database/updateTeam');
// Logs
const LOGTAGS = ["SERVER", "TeamMatchHistory"];

class TeamMatchHistory {
    constructor(req, res, mysql) {
        // Init variables
        this.teamID = null;
        this.mysql  = mysql;

        // Init binds
        this.getLastUpdate = this.getLastUpdate.bind(this);
        this.getHistory    = this.getHistory.bind(this);
        this.pushRequest   = this.pushRequest.bind(this);
        //

        if(req.params.teamID) {
            this.teamID = req.params.teamID;

            let me = this;
            async.waterfall([
                this.getLastUpdate,
                this.getHistory,
                // shouldUpdate result
                function(code, url, callback) {
                    if(code == 0 && url)
                        me.pushRequest(url, callback);
                    else
                        callback(null, code);
                }
            ], function(err, code){
                if(err)
                    res.json({ status: "ko", error: err });
                else {
                    let msg = null;
                    switch(code){
                        case 1: msg="The system is already updating your team's data.";break;
                        case 2: msg="Your team's data are up to date.";break;
                        case 3: msg="Your team's data are now updating.";break; 
                    }
                    res.json({ status: "ok", result: msg, code: code });
                }
            });
        }
        else
            res.json({ status: "ko", error: "Unknown team." });
    }

    getLastUpdate(callback) {
        let query = "SELECT `t`.`teamID`, `t`.`lastUpdate`, `t`.`isUpdating` FROM lolteam.`teams` AS `t` WHERE `t`.`id`=?;";
        this.mysql.query(query, [this.teamID], function(err, row, fields) {
            if (!err)
                callback(null, row[0]);
            else {
                Log(_.concat(LOGTAGS, "MYSQL"), err);
                callback("SQL Error in getLastUpdate.");
            }
        });
    }

    // NOTES :
    //  - We can get 'Undefined' for `teams`.`lastUpdate`. It means that the database value is 'NULL'.
    getHistory(row, callback) {
        var shouldUpdate = false;
        if(typeof(row.teamID) !== "undefined" && typeof(row.lastUpdate) !== "undefined" && typeof(row.isUpdating) !== "undefined") {
            // 7200000 = 1000*60*60*2 => Number of milliseconds in 2 hours (To compare with GMT based time in db)
            if((row.lastUpdate == null || (Date.now() - new Date(row.lastUpdate)) > 1000*60*60*2) && row.isUpdating == 0)
                shouldUpdate = true;

            if(shouldUpdate){
                var url = Config.RIOT.API.TEAM.getFullURL(row.teamID);
                if(url != null) 
                    callback(null, 0, url);
            }
            else {
                if(row.isUpdating == 1)
                    callback(null, 1, null);
                else
                    callback(null, 2, null);
            }
        }
        else {
            Log(_.concat(LOGTAGS, "MYSQL"), "Invalid MySQL response");
            callback("Invalid MySQL response");
        }
    }

    pushRequest(reqURL, callback) {
        let me=this;
        Config.RIOT.REQUEST.push(reqURL, function(err, fetchRes) {
            if(!err && fetchRes){
                let uT = new updateTeam((fetchRes.result ? fetchRes.result : fetchRes), me.teamID, me.mysql);
                callback(null, 3);
            }
            else{
                reqErrManager("TeamMatchHistory", {url: reqURL, res: res}, err, function(reqURL){
                    me.pushRequest(reqURL, callback);
                });
            }
        });
    }
}

module.exports = function(req,res,mysql) {
    new TeamMatchHistory(req, res, mysql);
};