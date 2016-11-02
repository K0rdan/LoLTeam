const API_KEY = '84437920-ce89-4491-97bd-df592330ab93';
const PROTOCOL = 'https';
const REGION = 'euw';

function getAPIBaseURL() { 
    return PROTOCOL + '://' + REGION + '.api.pvp.net/api/lol/' + REGION + '/'; 
}

module.exports = {
    API_KEY: API_KEY,
    API: {
        PROTOCOL: PROTOCOL,
        REGION: REGION,
        BASE_URL: getAPIBaseURL(),
        GAME: {
            VERSION : '1.3',
            getBaseURL: function(summonerID) { return getAPIBaseURL() + 'v' + this.VERSION + '/game/by-summoner/' + summonerID + '/'; },
            getFullURL: function(summonerID) { return this.getBaseURL(summonerID) + 'recent?api_key=' +  API_KEY; }
        } 
    }
};