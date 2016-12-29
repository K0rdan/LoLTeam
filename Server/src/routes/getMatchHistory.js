// Lib Imports
const _             = require('lodash');
const async         = require('async');
const fetch         = require('node-fetch');
// Custom Imports
const Config        = require('./../utils/config');
const Utils         = require('./../utils/utils');
const Log           = require('./../utils/log');
const getLastMatchIndex = require('./../utils/database/getLastMatchIndex');
// Logs
const TAGSLOG = ["SERVER", "MatchHistory"];

class MatchHistory {
    constructor(req, res, mysql) {
        // Init local variables
        this.req    = req;
        this.res    = res;
        this.mysql  = mysql;

        this.userID     = null;
        this.summonerID = null;

        // Init binds
        this._errorHandler      = this._errorHandler.bind(this);
        this._checkParams       = this._checkParams.bind(this);
        this._getLastMatchIndex = this._getLastMatchIndex.bind(this);
        this._getSummonerMatchs = this._getSummonerMatchs.bind(this);
        this._finish            = this._finish.bind(this);

        // Start process
        async.waterfall([
            this._checkParams,
            this._getLastMatchIndex,
            this._getSummonerMatchs,
            this._finish
        ], this._errorHandler);
    }

    _errorHandler(errCode, details) {
        if(errCode <0) {
            let errMessage = "";
            
            switch(errCode){
                case -1: errMessage = "Missing 'summonerID' parameter."; break;
                case -2: errMessage = "Invalid 'summonerID' parameter."; break;
                case -3: errMessage = "Invalid 'userID' parameter."; break;
                case -4: errMessage = "Can't get MatchList URL."; break;
                case -5: errMessage = "Unretryable error."; break;
                default: errMessage = "Unknow error.";
            }

            if(_.isArray(details))
                errMessage += " Details : " + details.join(' ') + '.';

            Log(TAGSLOG, errMessage);
            this.res.json({status: "ko", error: errMessage});
        }
        else
            this.res.json({status: "ok", message: "Match received.", result: details});
    }

    _checkParams(callback) {
        if(Config.DEBUG)
            Log(TAGSLOG, "checkParams");

        let errRaised = false;
        // Unknow error
        if(!this.req.params){
            callback(0, null);
            errRaised = true;
        }
        // Missing parameter
        if(this.req.params.length == 0 || !this.req.params.summonerID){
            callback(-1, null);
            errRaised = true;
        }
        // Check SummonerID in param
        if(!Utils.TYPES.SUMMONERID.check(this.req.params.summonerID)){
            errRaised = true;
            callback(-2, null);
        }
        else
            this.summonerID = this.req.params.summonerID;

        if(_.has(this.req, this.req.cookies.lt_user.id)){
            errRaised = true;
            callback(-3, null);
        }
        else
            this.userID = this.req.cookies.lt_user.id;

        // If we're there, that's all params are checked.
        if(!errRaised)
            callback(null);
    }

    _getLastMatchIndex(callback) {
        if(Config.DEBUG)
            Log(TAGSLOG, "getLastMatchIndex");
        getLastMatchIndex(this.userID, this.mysql, callback);
    }

    _getSummonerMatchs(lastMatchIndex, callback) {
        if(Config.DEBUG)
            Log(TAGSLOG, "getSummonerMatchs");

        if(!_.isUndefined(lastMatchIndex)){
            let me = this;
            // '+1000' in the timestamp allow to not retrieve the last match we have already stored
            let url = Config.RIOT.API.MATCHLIST.getFullURL(this.summonerID, new Date(lastMatchIndex).getTime()+1000);
            if(url != null) {
                Config.RIOT.REQUEST.push(url, function(err, fetchRes) {
                    if(!err)
                        callback(null, fetchRes);
                    else 
                        callback(-5, err);
                });
            }
            else
                callback(-4, [this.summonerID, new Date(lastMatchIndex).getTime()+1000]);
        }
    }

    _finish(result, callback) {
        // TODO : Save games into DB and init 'getMatchDetails'
        callback(0,result);
    }
};

module.exports = function(req, res, mysql) {
    new MatchHistory(req, res, mysql);
};