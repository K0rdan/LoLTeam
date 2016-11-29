// Lib Imports
const _      = require('lodash');
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
        this.updateTables     = this.updateTables.bind(this);
        this.addMatchs        = this.addMatchs.bind(this);
        this.selectNewMatchs  = this.selectNewMatchs.bind(this);
        this.addMatchsDetails = this.addMatchsDetails.bind(this);
        this.onSQLerror       = this.onSQLerror.bind(this);
        
        this.updateTables();
    }
    
    // Update 'teams' table
    updateTables() { 
        if(debug)
            Log(LOGTAGS, "updateTables");
            
        let teamDetails = this.data.teamStatDetails[0];
        let query = "UPDATE lolteam.`teams` SET `wins`=?, `looses`=? WHERE id=?;";
        let me = this;
        this.mysql.query(query, [teamDetails.wins, teamDetails.losses, this.teamID], function(err, row, fields) {
            if (!err)
                me.addMatchs();
            else
                me.onSQLerror(err);
        });
    }

    addMatchs() {
        if(debug)
            Log(LOGTAGS, "addMatchs");

        let query   = "INSERT INTO lolteam.`matchs` (`date`, `matchID`) VALUES ",
            gamesID = [],
            me      = this;

        _.each(this.games, function(value, key){
            query += "(FROM_UNIXTIME("+value.date.toString().substring(0,value.date.toString().length-3)+"), "+value.gameId+")" + (key < me.games.length-1 ? ',' : ';');
            gamesID.push(value.gameId);
        });
        
        this.mysql.query(query, function(err, row, fields) {
            if (!err){
                // At least one new row is insert
                if(row.affectedRows > 0)
                    me.selectNewMatchs(gamesID);
                // TODO : All games are already saved
                else {
                    console.log("No new matchs");
                    me.getGames(gamesID, mysql, callback);
                }
            }
            else
                me.onSQLerror(err);
        });
    }

    selectNewMatchs(gamesID) {
        if(debug)
            Log(LOGTAGS, "selectNewMatchs");

        // New matchs are matchs with NULL duration, team1 and team2 column.
        let query = "SELECT `matchID` FROM lolteam.`matchs` WHERE duration IS NULL AND team1 IS NULL AND team2 IS NULL AND matchID IN (" + gamesID.join() + ")";
        let me = this;
        this.mysql.query(query, function(err, row, fields) {
            if (!err){
                console.log(row);
                me.addMatchsDetails(row);
            }
            else
                me.callback();
        });
    }

    // NOTES :
    //  gamesID : Array of gameID.
    addMatchsDetails(gamesID) {
        if(debug)
            Log(LOGTAGS, "addMatchsDetails");

        this.callback();
    }

    onSQLerror(err) {
        // TODO : handle errors in callback
        this.callback();
    }
}