module.exports = function Login (req, res, mysql) {
    var query = "SELECT * FROM lolteam.users";
        log("MYSQL","Query : '" + query + "'");

        connection.query(query, function(err, rows, fields) {
            if (!err)
                console.log('The solution is: ', rows);
            else
                log("MYSQL", err);
        });
}