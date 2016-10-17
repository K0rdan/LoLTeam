// Lib Imports
const express    = require('express');
const mysql      = require('mysql');
const bodyParser = require('body-parser'); 

// Custom Imports
const Config     = require('./config');

module.exports = class Server {
    constructor() {
        this.app = null;
        this.connection = null;
        this.isConnected = false;

        this.listen(Config.SERVER.PORT);
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
        var me = this;
        this.app = express();
        this.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        this.app.use(bodyParser.json());
        this.connection = mysql.createConnection(Config.MYSQL);
        this.connection.connect(this._mysqlConnectionHandler.bind(this));
        this.app.listen(port, () => {
            me._log("SERVER",'Server listening on port ' + port);
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

        var me = this;
        this.app.post("/login",function(req, res) {
            console.log("SERVER - Receive login", req.body);
            res.set('Content-Type', 'application/json');
            me.dataRoutes.Login(req, res, me.connection);
        });
    }
}