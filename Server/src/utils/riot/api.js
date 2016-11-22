const RequestManager = require('./requestManager');

const PROTOCOL = 'https';
const REGION = 'euw';

var API_KEY = null;
var requestManager = new RequestManager();

function getAPIBaseURL() { 
    return PROTOCOL + '://' + REGION + '.api.pvp.net/api/lol/' + REGION + '/'; 
}

module.exports = {
    setAPIKey: function(api_key) {
        API_KEY = api_key;
    },
    getAPIKey: function() {
        return API_KEY;
    },
    API: {
        PROTOCOL: PROTOCOL,
        REGION: REGION,
        BASE_URL: getAPIBaseURL(),
        GAME: {
            VERSION : '1.3',
            getBaseURL: function(summonerID) { return getAPIBaseURL() + 'v' + this.VERSION + '/game/by-summoner/' + summonerID + '/'; },
            getFullURL: function(summonerID) { 
                if(API_KEY != null)
                    return this.getBaseURL(summonerID) + 'recent?api_key=' + API_KEY;
                else 
                    return null;
            }
        },
        TEAM: {
            VERSION: '2.4',
            getFullURL: function(teamID) {
                if(API_KEY != null) 
                    return getAPIBaseURL() + 'v' + this.VERSION + '/team/' + teamID + '?api_key=' + API_KEY;
                else
                    return null;
            },
        }
    },
    REQUEST: {
        setQueryRateLimit: function(queryRateLimit) {
            requestManager.setQueryRateLimit(queryRateLimit);
        },
        push: function(url, callback) {
            requestManager.pushRequest(url, callback);
        }
    }
};