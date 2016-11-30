// Lib Imports
const _      = require('lodash');
const async  = require('async');
// Custom Imports
const Log    = require('./../log');
// Logs
const LOGTAGS = ["SERVER", "UpdateTeam"];

const debug = true;

module.exports = class updateTeam{
    constructor(data, teamID, mysql, callback) {
        // Init variables
        this.mysql    = mysql;
        this.data     = data[Object.keys(data)[0]];
        this.teamID   = teamID;
        this.games    = this.data.matchHistory;
        this.callback = callback;

        // Init binds
        this.updateTeamDetails = this.updateTeamDetails.bind(this);
        this.addMatchs         = this.addMatchs.bind(this);
        this.selectNewMatchs   = this.selectNewMatchs.bind(this);
        this.addMatchsDetails  = this.addMatchsDetails.bind(this);
        this.onSQLerror        = this.onSQLerror.bind(this);
        
        async.waterfall([
            this.updateTeamDetails,
            this.addMatchs,
            this.addMatchsDetails
        ], function(err, result) {
            console.log("Waterfall end", arguments);
        });
    }
    
    // Update 'teams' table
    updateTeamDetails(callback) { 
        if(debug)
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
        if(debug)
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
                        if(!err)
                            me.selectNewMatchs(gamesID, callback);
                        else
                            callback(err);                        
                    });
                }
            }
            else
                callback(err);
        });
    }

    selectNewMatchs(gamesID, callback) {
        if(debug)
            Log(LOGTAGS, "selectNewMatchs");

        // New matchs are matchs with NULL duration, team1 and team2 column.
        let query = "SELECT `matchID` FROM lolteam.`matchs` WHERE duration IS NULL AND team1 IS NULL AND team2 IS NULL AND matchID IN (" + gamesID.join() + ")";
        let me = this;
        this.mysql.query(query, function(err, row, fields) {
            if (!err)
                callback(null, row);
            else
                callback(err);
        });
    }

    // NOTES :
    //  gamesID : Array of gameID.
    addMatchsDetails(gamesID, callback) {
        if(debug)
            Log(LOGTAGS, "addMatchsDetails");

        callback(null, []);
    }

    onSQLerror(err) {
        // TODO : handle errors in callback
        
    }
}