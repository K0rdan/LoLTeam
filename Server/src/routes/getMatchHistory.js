// Lib Imports
const async  = require('async');
const fetch  = require('node-fetch');
// Custom Imports
const Config = require('./../utils/config');
const Utils  = require('./../utils/utils');
const Log    = require('./../utils/log');
// Logs
const TAGSLOG = ["SERVER", "MatchHistory"];

class MatchHistory {
    constructor(req, res, mysql) {
        // Init local variables
        this.req    = req;
        this.res    = res;
        this.mysql  = mysql;

        // Init binds
        this._errorHandler      = this._errorHandler.bind(this);
        this._checkParams       = this._checkParams.bind(this);
        this._getSummonerMatchs = this._getSummonerMatchs.bind(this);

        // Start process
        async.waterfall([
            this._checkParams,
            this._getSummonerMatchs
        ], this._errorHandler);
    }

    _errorHandler(errCode, result) {
        let errMessage = "";
        switch(errCode){
            case -1: errMessage = "Missing 'summonerID' parameter"; break;
            case -2: errMessage = "Invalid 'summonerID' parameter"; break;
            default: errMessage = "Unknow error";
        }

        Log(TAGSLOG, errMessage);
    }

    _checkParams(callback) {
        // Unknow error
        if(!this.req.params)
            callback(0, null);
        // Missing parameter
        if(this.req.params.length == 0 || !this.req.params.summonerID)
            callback(-1, null);
        //

        if(!Utils.TYPES.SUMMONERID.check(this.req.params.summonerID))
            callback(-2, null);

        // If we're there, that's all params are checked.
        callback(null, null);
    }

    _getSummonerMatchs(callback) {
        console.log("Params ok !");
    }
};

module.exports = function(req, res, mysql) {
    new MatchHistory(req, res, mysql);
};

/*module.exports = function MatchHistory (req, res, mysql, clientPool) {
    if(req.params.user){
        var url = Config.RIOT.API.GAME.getFullURL(req.params.user.summonerID);
        if(url != null) {
            fetch(url)
            .then(function(response) {
                // TODO : process response
                return response.json();
            })
            .then(function(json){
                res.json({matchs: json});
            })
            .catch(function(error) {
                Log(TAGSLOG, error.message);
            });
        }
    }
    else {
        res.json({ error: "Unknown user."});
        return 0;
    }
}*/