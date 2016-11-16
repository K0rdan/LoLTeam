const config = {
    SERVER: 'server',
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

        // Init binds
        this._restoreSession = this._restoreSession.bind(this);

        this._restoreSession();
    }

    _isValidParameter(...params) {
        // TODO : Check params before sending them to the server
        return true;
    }

    _restoreSession() {
        if(!this.isConnected){
            return fetch('http://' + config.SERVER + ':' + config.PORT + '/')
            .then(function(response) {
                if(response.ok)
                    return response.json();       
                else
                    console.log('[API][RetrieveSession] Wrong network answer');
            })
            .then(function (json) {
                console.log('[API][RetrieveSession] response');
                console.log(json);
            })
            .catch(function(error) {
                console.log('[API][RetrieveSession][Error] Fetch operation error : ' + error.message);
            });
        }
        else
            console.log('[API][RetrieveSession] Already connected');
    }

    _error(method, message) {
        console.log("[API][" + method + "][Error] " + message + ".");
    }

    isConnected() {
        return this.isConnected;
    }

    login(username, password, callback) {
        var me = this;

        /*if(!this.connected) {
            if(this._restoreSession())
                return;             // If a user session is restored, we can leave the method.
        }*/

        if(this._isValidParameter(username, password) && callback){
            return fetch(new Request('http://' + config.SERVER + ':' + config.PORT + '/login',{ 
                method: 'POST',
                headers: this.requestHeaders,
                mode: 'cors',
                credentials: 'include',
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
                    console.log("[API][Login] JSON : ", json);
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

    getMatchHistory(summonerID, callback) {
        if(this.isConnected && this._isValidParameter(summonerID) && callback) {
            return fetch('http://' + config.SERVER + ':' + config.PORT + '/matchhistory/' + summonerID)
            .then(function(response) {
                if(response.ok)
                    return response.json();       
                else
                    console.log('[API][MatchHistory] Wrong network answer');
            })
            .then(function (json) {
                console.log(json);
            })
            .catch(function(error) {
                console.log('[API][MatchHistory][Error] Fetch operation error : ' + error.message);
            });
        }
        else 
            console.log('[API][MatchHistory][Error] Invalid parameter, or not connected.');
    }
};