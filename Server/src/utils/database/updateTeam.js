// Lib Imports
const _             = require('lodash');
const async         = require('async');
// Custom Imports
const Config        = require('./../config');
const reqErrManager = require('./../riot/requestErrorsManager');
const insertMatch   = require('./insertMatch');
const Log           = require('./../log');
// Logs
const LOGTAGS = ["SERVER", "UpdateTeam"];

module.exports = class updateTeam{
    constructor(data, teamID, mysql) {
        // Init variables
        this.mysql    = mysql;
        this.data     = data[Object.keys(data)[0]];
        this.teamID   = teamID;
        this.games    = this.data.matchHistory;

        // Init binds
        this.updateTeamDetails = this.updateTeamDetails.bind(this);
        this.addMatchs         = this.addMatchs.bind(this);
        this.selectNewMatchs   = this.selectNewMatchs.bind(this);
        this.addMatchsDetails  = this.addMatchsDetails.bind(this);
        this.pushRequest       = this.pushRequest.bind(this);
        
        async.waterfall([
            this.updateTeamDetails,
            this.addMatchs,
            this.addMatchsDetails
        ], function(err, result) {
            if(err)
                Log(LOGTAGS, err);
            else
                console.log("Result :", result);
        });
    }
    
    // Update 'teams' table
    updateTeamDetails(callback) { 
        if(Config.DEBUG)
            Log(LOGTAGS, "updateTables");
            
        let teamDetails = this.data.teamStatDetails[1];
        let query = "UPDATE lolteam.`teams` SET `wins`=?, `looses`=? WHERE id=?;";
        let me = this;
        
        this.mysql.query(query, [teamDetails.wins, teamDetails.losses, this.teamID], function(err, row, fields) {
            if (!err)
                callback(null);
            else
                callback(err);
        });
    }

    // Insert date into 'matchs' table
    addMatchs(callback) {
        if(Config.DEBUG)
            Log(LOGTAGS, "addMatchs");

        let query   = "INSERT INTO lolteam.`matchs` (`date`, `matchID`) VALUES ",
            gamesID = [],
            me      = this;

        _.each(this.games, function(value, key){
            query += "(FROM_UNIXTIME("+value.date.toString().substring(0,value.date.toString().length-3)+"), "+value.gameId+")" + (key < me.games.length-1 ? ',' : '');
            gamesID.push(value.gameId);
        });

        // Don't throw errors if a game is already in the table.
        query += " ON DUPLICATE KEY UPDATE id=id;";
        
        this.mysql.query(query, function(err, row, fields) {
            if (!err){
                // At least one new row is insert
                if(row.affectedRows > 0) {
                    // isUpdating -> true 
                    me.mysql.query("UPDATE lolteam.`teams` SET `isUpdating`=? WHERE id=?;", [1, me.teamID], function(err, row, fields){
                        if(err)
                            callback(err);                        
                    });
                }

                me.selectNewMatchs(gamesID, callback);
            }
            else
                callback(err);
        });
    }

    selectNewMatchs(gamesID, callback) {
        if(Config.DEBUG)
            Log(LOGTAGS, "selectNewMatchs");

        // New matchs are matchs with NULL duration, team1 and team2 column.
        let query = "SELECT `matchID` FROM lolteam.`matchs` WHERE duration IS NULL AND team1 IS NULL AND team2 IS NULL AND matchID IN (" + gamesID.join() + ");";
        let me = this;
        this.mysql.query(query, function(err, rows, fields) {
            if (!err)
                callback(null, rows);
            else
                callback(err);
        });
    }

    // NOTES :
    //  gamesID : Array of gameID.
    addMatchsDetails(gamesID, callback) {
        if(Config.DEBUG)
            Log(LOGTAGS, "addMatchsDetails");
        
        let me = this;
        _.each(gamesID, function(value, key){
            me.pushRequest(Config.RIOT.API.MATCH.getFullURLWithTimeline(value.matchID), key, callback);
        });
    }

    pushRequest(reqURL, key, callback) {
        let me = this;
        Config.RIOT.REQUEST.push(reqURL, function(err, fetchRes){
            if(err || !fetchRes) {
                reqErrManager(LOGTAGS[1], {url: reqURL}, err, function(reqURL){
                    me.pushRequest(reqURL, callback);
                });
            }
            else {
                new insertMatch(me.teamID, me.mysql, fetchRes);
            }

            console.log("Parameter : KEY", key);

            /*if(key == gamesID.length)
                console.log("LAST ELEMENT CALLBACK");*/
        });
    }
}