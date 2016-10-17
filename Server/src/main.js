// Lib Imports
// const express   = require('express');
// const mysql     = require('mysql');

// Custom Imports
const Server    = require('./server');

// Start
new Server();
/*var app = null, connection = null, isConnected = false;

init();
app.get("/",route_main);
var srv = app.listen(PORT, function() {
  log("SERVER",'Server listening on port ' + srv.address().port);
});


function getDate() {
    var date = new Date();
    var year = date.getFullYear(),
        month= date.getMonth()+1,
        day  = date.getDate(), 
        hour = date.getHours(),
        min  = date.getMinutes(),
        sec  = date.getSeconds();
    month = month < 9 ? "0"+month : month;

    return year + "/" + month + "/" + day + ":" + hour + "-" + min + "-" + sec;
}

function log(type, msg) {
    if(type.length < 6){
        for(var i=0; type.length<6;i++)
            type += " ";
    }
    else
        type = type.substr(0,6);

    console.log("[" + getDate() + "][" + type + "] " + msg);
}

function init() {
    app = express();
    connection = mysql.createConnection(MYSQL_CONF);
    connection.connect(function(err){
        if(err){
            log("MYSQL", "Error connecting to database : " + err);
            return null; 
        }

        isConnected = true; 
    });
}

function route_main(req, res) {    
    if(isConnected) {
        var query = "SELECT * FROM lolteam.users";
        log("MYSQL","Query : '" + query + "'");

        connection.query(query, function(err, rows, fields) {
            if (!err)
                console.log('The solution is: ', rows);
            else
                log("MYSQL", err);
        });
    }
}*/