// Lib Imports
const _      = require('lodash');
// Custom Imports
const Log    = require('./../../utils/log');
// Logs
const LOGTAGS = ["SERVER", "LastMatchIndex"];

// NOTES :
//  LastMatchIndex return an EPOCH timestamp or null
module.exports = function LastMatchIndex (userID, mysql, callback) {
    if(userID != null) {
        let query = "SELECT timestamp FROM `user_matchs` WHERE userId=? ORDER BY timestamp DESC LIMIT 1";
        mysql.query(query, [userID], function(err, row, fields) {
            if (!err){
                if(row[0] && row[0].timestamp)
                    callback(null, row[0].timestamp);
                else
                    callback(null, null);
            }
            else {
                Log(_.concat(LOGTAGS, "MYSQL"), err);
                callback(null, null);
            }
        });
    }
    else
        callback(null, null);
}