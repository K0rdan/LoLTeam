module.exports = function Login (req, res, mysql) {
    var query = "SELECT * FROM lolteam.users";
    mysql.query(query, function(err, rows, fields) {
        if (!err)
            res.json({users : rows});
        else
            console.log("MYSQL", err);
    });
}