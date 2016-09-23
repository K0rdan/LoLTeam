// Lib Constant
const express   = require('express');
const mysql     = require('mysql');

// Custom Constant 
const PORT = 8000;
const MYSQL_CONF = {
    host        : 'lolteam-db',
    localAddress: 'lolteam-db',
    user        : 'root',
    password    : 'cky_w+IQ@l',
    database    : 'lolteam'
};

// Start
var app = null, connection = null, isConnected = false;

init();
app.get("/",route_main);
var server = app.listen(PORT, function() {
  log('Server listening on port ' + server.address().port);
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
}