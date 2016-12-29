const RequestManager = require('./requestManager');
const PROTOCOL       = 'https';
const REGION         = 'euw';

let API_KEY          = null;
let requestManager   = new RequestManager();

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
        MATCH: {
            VERSION : '2.2',
            TIMELINE: false,
            setIncludeTimeline: function(includeTimeline) { this.TIMELINE = includeTimeline; },
            getIncludeTimeline: function() { return this.TIMELINE; },
            getBaseURL: function(gameID) { return getAPIBaseURL() + 'v' + this.VERSION + '/match/' + gameID ; },
            getFullURL: function(gameID) {
                if(gameID && API_KEY != null)
                    return this.getBaseURL(gameID) + '?includeTimeline=' + this.getIncludeTimeline() + '&api_key=' + API_KEY;
                else 
                    return null;
            },
            getFullURLWithTimeline: function(gameID) {
                if(gameID && API_KEY != null)
                    return this.getBaseURL(gameID) + '?includeTimeline=true&api_key=' + API_KEY;
                else
                    return null;
            }
        },
        MATCHLIST: {
            VERSION: '2.2',
            getBaseURL: function(summonerID) { return getAPIBaseURL() + 'v' + this.VERSION + '/matchlist/by-summoner/' + summonerID ; },
            getFullURL: function(summonerID, timestamp) { 
                if(summonerID && timestamp && API_KEY != null)
                    return this.getBaseURL(summonerID) + '?beginTime=' + timestamp + '&api_key=' + API_KEY;
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
            requestManager._queuePushRequest(url, callback);
        }
    }
};