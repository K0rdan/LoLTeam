const fetch = require('node-fetch');
// Custom Imports
const Config = require('./../utils/config');
const Log    = require('./../utils/log');
// Logs
const TAGSLOG = ["SERVER", "MatchHistory"];

module.exports = function MatchHistory (req, res, mysql, clientPool) {
    if(req.params.user){
        fetch(Config.RIOT.API.GAME.getFullURL(req.params.user.summonerID))
        .then(function(response) {
            // TODO : process response
            return response.json();
        })
        .then(function(json){
            console.log(json);
            //Log(TAGSLOG, json);
        })
        .catch(function(error) {
            Log(TAGSLOG, error.message);
        });
    }
    else {
        res.json({ error: "Unknown user."});
        return 0;
    }
}