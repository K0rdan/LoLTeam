// Lib Imports
const _             = require('lodash');
const async         = require('async');
const fetch         = require('node-fetch');
// Custom Imports
const Config        = require('./../utils/config');
const Utils         = require('./../utils/utils');
const Log           = require('./../utils/log');
// Logs
const TAGSLOG = ["SERVER", "MatchDetails"];

module.exports = class MatchDetails {
    constructor(mysql) {
        // Init local variables
        this.mysql  = mysql;

        // Init binds
        this._errorHandler      = this._errorHandler.bind(this);
        this._getMatchIDs       = this._getMatchIDs.bind(this);
        this._getMatchDetails   = this._getMatchDetails.bind(this);

        // Start process
        async.waterfall([
            this._getMatchIDs,
            this._getMatchDetails
        ], this._errorHandler);
    }

    _errorHandler(errCode, details) {
        if(errCode < 0) {
            let errMessage = "";
            
            switch(errCode){
                case -1: errMessage = "Error while getting match's ID."; break;
                case -2: errMessage = "Loop error : " + details; break;
                default: errMessage = "Unknow error.";
            }

            Log(TAGSLOG, errMessage);
        }
        else {
            if(this.res)
                this.res.json({status: "ok", message: "Match received.", result: details});
        }
    }

    _getMatchIDs(callback) {
        callback(null, [2964884538]);
    }

    _getMatchDetails(matchIDs, callback) {
        async.each(matchIDs, function(matchID, callback){
            Config.RIOT.REQUEST.push(Config.RIOT.API.MATCH.getFullURLWithTimeline(matchID), function(err, fetchRes) {
                if(err)
                    callback(err); // loop callback
                else {
                    // saveDataIntoDB(fetchRes);
                    console.log("Save data from " + matchID + " into DB");
                }
            });

            callback(); // loop callback
        }, function(err) {
            if(err)
                callback(-2, err);  // global callback
            else 
                callback(null, null); // global callback
        });
    }
};