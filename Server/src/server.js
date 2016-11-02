// Lib Imports
const express    = require('express');
const mysql      = require('mysql');
const bodyParser = require('body-parser'); 

// Custom Imports
const Config     = require('./utils/config');
const Log        = require('./utils/log');

module.exports = class Server {
    constructor() {
        this.app = null;
        this.connection = null;
        this.isConnected = false;
        this.clientPool = [];

        this.listen(Config.SERVER.PORT);
        this._setupRoutes();
    }

    listen(port = Config.SERVER.PORT) {
        var me = this;
        this.app = express();
        this.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");     // Allow Origin : All
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        this.app.use(bodyParser.json());                        // Allow body type : JSON
        this.app.use(bodyParser.urlencoded({ extended:true })); // Allow body type : URL-encoded
        this.connection = mysql.createConnection(Config.MYSQL);
        this.connection.connect(this._mysqlConnectionHandler.bind(this));
        this.app.listen(port, () => {
            me._log("SERVER",'Server listening on port ' + port);
        });
    } 

    _mysqlConnectionHandler(err) {
        if(err){
            Log(["MYSQL"], "Error connecting to database : " + err);
            return null; 
        }

        this.isConnected = true;
    }

    _setupRoutes() {
        this.dataRoutes = {
            Login: require("./routes/login"),
            getSummonerID: require("./routes/getSummonerID"),
            getMatchHistory: require("./routes/getMatchHistory")
        };

        var me = this;
        this.app.param('user', function(req, res, next, user) {
            // Check if user is in the pool
            var player = null;
            for(client in me.clientPool){
                if(client.name == user)
                    player = client;
            }
            if(player != null) {
                req.params.user = player;
                next();
            }
            else {
                req.params.user = null;
                Log(["SERVER"],"User (" + user + ") not found. You must be logged to get matchs.");

                // TEMPS
                req.params.user = {id: 1, name: "test", pass: "pass", summonerID: 20066789};
                next();
            }
        });
        //////
        this.app.post("/login",function(req, res) {
            res.set('Content-Type', 'application/json');
            var loginRes = me.dataRoutes.Login(req, res, me.connection);
            if(loginRes != 0)
                me.clientPool.push(loginRes);
            else 
                Log(["LOGIN"], 'Login error');
        });
        this.app.get("/matchhistory/:user", function(req, res, next) {
            res.set('Content-Type', 'application/json');
            var historyRes = me.dataRoutes.getMatchHistory(req, res, me.connection, me.clientPool);
        });
    }
}