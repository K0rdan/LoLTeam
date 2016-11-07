// Lib Imports
const _       = require('lodash');
// Custom Imports
const Log     = require('./../utils/log');
// Const
const LOGTAGS = ["SERVER", "LOGIN"];

module.exports = function Login (req, res, mysql, callback) {
    if(req.body && req.body.user && req.body.pass){
        var query = "SELECT `id`,`name`,`email`,`summonerID` FROM lolteam.`users` WHERE `name`=? AND `pass`=? LIMIT 1;";
        mysql.query(query, [req.body.user, req.body.pass], function(err, row, fields) {
            if (!err) {
                if(row[0].length != 0){
                    res.json({status: "ok", message: "You're now connected.", user : row});
                    callback(row[0], req);
                }
                else {
                    res.json({user : row});
                    callback(0);
                }
            }
            else
                Log(_.concat(LOGTAGS, "MYSQL"), err);
        });
    }
    else {
        res.json({ error: "Invalid parameter(s)"});
        callback(0);
    }
}