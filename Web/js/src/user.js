// Lib imports
import Log from './utils/log';

export default class User {
    constructor(API) {
        // Init vars
        this.API = API;

        this.id = null;
        this.name = null;
        this.email = null;
        this.summonerID = null;
        this.matchs = null;

        this.logParams = {
            component: "User",
            options: {
                timestamp: true
            }
        };

        // Init binds
        this._log = this._log.bind(this);
        this._loginResponseHandler = this._loginResponseHandler.bind(this);
        this._restoreSessionResponseHandler = this._restoreSessionResponseHandler.bind(this);
    }

    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }
    getSummonerID() {
        return this.summonerID;
    }

    _log(method, msg) {
        new Log(this.logParams.component, method, msg, this.logParams.options);
    }

    // RESTORE SESSION
    restoreSession(callback) {
        var me = this;
        this.API.restoreSession(function(user) {
            me._restoreSessionResponseHandler(user);
            if(callback)
                callback();
        });
    }
    _restoreSessionResponseHandler(user) { this._loginResponseHandler(user); }
    //
    // LOGIN
    login(username, password, callback) {
        var me = this;
        this.API.login(username, password, function(user) {
            me._loginResponseHandler(user);
            if(callback)
                callback();
        });
    }
    _loginResponseHandler(user) {
        if(user && user.id && user.name && user.email && user.summonerID && user.summonerID != 0){
            this.id = user.id;
            this.name = user.name;
            this.email = user.email;
            this.summonerID = user.summonerID;
        }
        else
            this._log("Login","Invalid or missing parameter in login response");
    }
    //
    // TEAMS LIST
    getTeamsList(callback) {
        if(this.id != null) {
            var me = this;
            this.API.getTeamsList(this.id, function(teams) {
                if(callback)
                    callback(teams);
            });
        }
    }
    //
    // MATCH HISTORY
    getMatchHistory(callback) {
        if(this.summonerID != null) {
            var me = this;
            this.API.getMatchHistory(this.summonerID, function(matchs) {
                console.log(matchs);
            });
        }
    }
    //
    isConnected() {
        return this.API.isConnected();
    }
};