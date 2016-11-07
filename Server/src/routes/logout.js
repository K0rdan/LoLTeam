// Lib Imports
const _       = require('lodash');
// Custom Imports
const Log     = require('./../utils/log');
// Const
const LOGTAGS = ["SERVER", "LOGOUT"];

module.exports = function Logout(req, res, clientPool) {
    if(req.body && req.body.userID) {
        var user = null;

        // Delete the client of the pool
        clientPool = _.filter(clientPool, function(client){
            if (client.id == req.body.userID){
                user = client;
                return false;
            }
            else
                return true;
        });
        
        // Delete his session
        req.session.destroy(function(err){
            if(err){
                console.log(err);
            } else {
                Log(LOGTAGS, user.name.toUpperCase() + ' is now disconnceted.');
                res.json({status: "ok", message: "You're now disconnected."});
            }
        });
    }
    else {
        res.json({error: "Invalid parameter(s)"});
        callback(0);
    }
}