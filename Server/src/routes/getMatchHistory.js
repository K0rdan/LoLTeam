// Lib Imports
const fetch = require('node-fetch');
// Custom Imports
const Config = require('./../utils/config');
const Log    = require('./../utils/log');
// Logs
const TAGSLOG = ["SERVER", "MatchHistory"];

module.exports = function MatchHistory (req, res, mysql, clientPool) {
    if(req.params.user){
        var url = Config.RIOT.API.GAME.getFullURL(req.params.user.summonerID);
        if(url != null) {
            fetch(url)
            .then(function(response) {
                // TODO : process response
                return response.json();
            })
            .then(function(json){
                res.json({matchs: json});
            })
            .catch(function(error) {
                Log(TAGSLOG, error.message);
            });
        }
    }
    else {
        res.json({ error: "Unknown user."});
        return 0;
    }
}