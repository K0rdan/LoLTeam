export default class User {
    constructor(API) {
        // Init vars
        this.API = API;

        this.id = null;
        this.name = null;
    }

    getId() {
        return this.id;
    }
    getName() {
        return this.name;
    }

    login(username, password, callback) {
        var me = this;
        this.API.login(username, password, function(user) {
            me._loginResponseHandler(user);
            if(callback)
                callback();
        });
    }

    _loginResponseHandler(user) {
        if(user && user.id && user.name && user.email){
            this.id = user.id;
            this.name = user.name;
            this.email = user.email;
        }
    }
};