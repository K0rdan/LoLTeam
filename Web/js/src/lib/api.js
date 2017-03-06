import Log from "./../utils/log";

const config = {
    SERVER: "localhost",
    PORT: 8000,
    TIMEOUT: 10000
};

export default class API {
    constructor() {
        // Init variables
        this.isConnected = false;
        this.requestHeaders = new Headers({
            "Accept": "application/json",
            "Content-Type": "application/json",
        });

        this.logParams = {
            component: "API",
            options: {
                timestamp: true
            }
        };

        // Init binds
        this._log = this._log.bind(this);
        this.restoreSession = this.restoreSession.bind(this);
    }

    _log(method, msg) {
        new Log(this.logParams.component, method, msg, this.logParams.options);
    }
    _error(method, message) {
        this._log(method, "[Error] " + message);
    }

    _isValidParameter(...params) {
        // TODO : Check params before sending them to the server
        return true;
    }

    restoreSession(callback) {
        var me = this;
        if(!this.isConnected){
            return fetch(
            new Request('http://' + config.SERVER + ':' + config.PORT + '/',{ 
                method: "GET",
                headers: this.requestHeaders,
                mode: "cors",
                credentials: "include"
            }))
            .then(function(response) {
                if(response.ok)
                    return response.json();       
                else
                    me._error("RestoreSession", "Wrong network answer");
            })
            .then(function (json) {
                if(json.status == "ok"){
                    me.isConnected = true;
                    return json.user;
                }
                else 
                    return null;
            })
            .then(callback)
            .catch(function(error) {
                me._error("RestoreSession", "Fetch operation error : " + error.message);
            });
        }
        else
            this._log("RestoreSession", "Already connected");
    }

    isConnected() {
        return this.isConnected;
    }

    login(username, password, callback) {
        var me = this;

        if(this._isValidParameter(username, password) && callback){
            return fetch(new Request('http://' + config.SERVER + ':' + config.PORT + '/login',{ 
                method: "POST",
                headers: this.requestHeaders,
                mode: "cors",
                credentials: "include",
                body: JSON.stringify({
                    user: encodeURIComponent(username),
                    pass: encodeURIComponent(password),
                })
            }))
            .then(function(response) {
                if(response.ok)
                    return response.json();
                
                me._error("Login", "Wrong network answer");
            })
            .then(function(json){
                if(json && json.user){
                    me.isConnected = true;
                    return json.user;
                }
                else {
                    if(json.status == "ko")
                        me._error("Login", json.message);
                    else
                        me._error("Login", "Problem with JSON response");
                        
                    return null;
                }
            })
            .then(callback)
            .catch(function(error) {
                me._error("Login","Fetch operation error : " + error.message);
            });
        }
        else 
            me._error("Login","Invalid parameter");
    }

    logout() {
        return fetch('http://' + config.SERVER + ':' + config.PORT + '/logout')
            .then(function(response) {
                if(response.ok)
                    return response.json();       
                else
                    console.log('[API][Logout] Wrong network answer');
            })
            .then(function (json) {
                console.log('[API][Logout] response');
                console.log(json);
            })
            .catch(function(error) {
                console.log('[API][Logout][Error] Fetch operation error : ' + error.message);
            });
    }

    getTeamsList(userID, callback) {
        if(this.isConnected && this._isValidParameter(userID) && callback) {
            var me = this;
            return fetch('http://' + config.SERVER + ':' + config.PORT + '/teamslist/' + userID)
            .then(function(response) {
                if(response.ok)
                    return response.json();
                else
                    me._error("TeamsList", "Wrong network answer");
            })
            .then(function(json) {
                callback(json.result);
            })
            .catch(function(error) {
                me._error("TeamsList", "Fetch operation error : " + error.message);
            });
        }
        else 
            this._error("TeamsList", "Invalid parameter, or not connected.");
    }

    getMatchHistory(summonerID, callback) {
        if(this.isConnected && this._isValidParameter(summonerID) && callback) {
            var me = this;
            return fetch('http://' + config.SERVER + ':' + config.PORT + '/matchhistory/' + summonerID)
            .then(function(response) {
                if(response.ok)
                    return response.json();       
                else
                    me._error("MatchHistory", "Wrong network answer");
            })
            .then(function (json) {
                me._log(json);
            })
            .catch(function(error) {
                me._error("MatchHistory", "Fetch operation error : " + error.message);
            });
        }
        else 
            this._error("MatchHistory", "Invalid parameter, or not connected.");
    }
};