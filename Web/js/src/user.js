export default class User {
    constructor(API) {
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

    login(username, password) {
        this.API.login(username, password);
    }
};