const config = {
    SERVER: 'server',
    PORT: 8000,
    TIMEOUT: 10000
};

export default class API {
    constructor() {
        
    }

    _isValidParameter(...params) {
        // TODO : Check params before sending them to the server
        return true;
    }

    login(username, password, callback) {
        if(this._isValidParameter(username, password) && callback){
            return fetch(new Request('http://' + config.SERVER + ':' + config.PORT + '/login',{ 
                method: 'POST',
                headers: new Headers({
                    "Content-Type": "application/json"
                }),
                mode: 'cors',
                body: JSON.stringify({
                    user: encodeURIComponent(username),
                    pass: encodeURIComponent(password),
                })
            }))
            .then(function(response) {
                if(response.ok)
                    return response.json();       
                else
                    console.log('[API][Login] Wrong network answer');
            })
            .then(function(json){
                if(json && json.user && json.user.length == 1){
                    console.log("[API][Login] JSON : ", json);
                    return json.user[0];
                }
                else {
                    console.log("[API][Login] Problem with JSON response.");
                    return null;
                }
            })
            .then(callback)
            .catch(function(error) {
                console.log('[API][Login][Error] Fetch operation error : ' + error.message);
            });
        }
    }

    getMatchHistory(summonerID, callback) {
        if(this._isValidParameter(summonerID) && callback) {
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
    }
};