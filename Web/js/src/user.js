export default class User {
    constructor(API) {
        // Init vars
        this.API = API;

        this.id = null;
        this.name = null;
        this.email = null;
        this.summonerID = null;
        this.matchs = null;

        // Init binds
        this._loginResponseHandler = this._loginResponseHandler.bind(this);
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
        if(user && user.id && user.name && user.email && user.summonerID){
            this.id = user.id;
            this.name = user.name;
            this.email = user.email;
            this.summonerID = user.summonerID;
            console.log(this);
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