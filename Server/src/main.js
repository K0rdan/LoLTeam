var app         = express();
var mysql       = require('mysql');
var connection  = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'cky_w+IQ@l',
    database : 'db'
});

app.get("/",function(req,res){
    connection.query('SELECT * from users', function(err, rows, fields) {
    connection.end();
    if (!err)
        console.log('The solution is: ', rows);
    else
        console.log('Error while performing Query.');
    });
});
 app.listen(3000);