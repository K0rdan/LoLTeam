module.exports = function Login (req, res, mysql) {
    if(req.body && req.body.user && req.body.pass){
        var query = "SELECT * FROM lolteam.users WHERE name=? AND pass=? LIMIT 1;";
        mysql.query(query, [req.body.user, req.body.pass], function(err, row, fields) {
            if (!err) {
                res.json({user : row});
                return row;
            }
            else
                console.log("MYSQL", err);
        });
    }
    else {
        res.json({ error: "Invalid parameter(s)"});
        return 0;
    }
}