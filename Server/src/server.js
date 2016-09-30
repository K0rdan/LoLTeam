// Lib Imports
const express   = require('express');
const mysql     = require('mysql');

// Custom Imports
const Config    = require('./config');

module.exports = class Server {
    constructor() {
        this.app = null;
        this.connection = null;
        this.isConnected = false;

        this.listen(Config.SERVER.PORT);
        if(this.isConnected)
            this._setupRoutes();
    }

    _getDate() {
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

    _log(type, msg) {
        if(type.length < 6){
            for(var i=0; type.length<6;i++)
                type += " ";
        }
        else
            type = type.substr(0,6);

        console.log("[" + this._getDate() + "][" + type.toUpperCase() + "] " + msg);
    }

    listen(port = Config.SERVER.PORT) {
        this.app = express();
        this.connection = mysql.createConnection(Config.MYSQL);
        this.connection.connect(this._mysqlConnectionHandler);
        this.app.listen(port, () => {
            this._log("SERVER",'Server listening on port ' + port);
        });
    } 

    _mysqlConnectionHandler(err) {
        if(err){
            this._log("MYSQL", "Error connecting to database : " + err);
            return null; 
        }

        this.isConnected = true;
    }

    _setupRoutes() {
        this.dataRoutes = {
            Login: require("./routes/login")
        };

        app.get("/",this.dataRoutes.Login.bind(this.connection));
    }
}