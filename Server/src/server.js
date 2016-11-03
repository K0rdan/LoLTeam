// Lib Imports
const express      = require('express');
const session      = require('express-session');
const mysql        = require('mysql');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const redis        = require('redis');
const redisStore   = require('connect-redis')(session);

// Custom Imports
const Config     = require('./utils/config');
const Log        = require('./utils/log');

module.exports = class Server {
    constructor() {
        this.app = null;
        this.connection = null;
        this.isConnected = false;
        this.clientPool = [];

        // Custom binds
        this._loginResultHandler = this._loginResultHandler.bind(this);
        //

        this.init();
    }

    init() {
        this.redisClient = redis.createClient(Config.SERVER.REDIS.PORT, Config.SERVER.REDIS.HOST);
        this.connection  = mysql.createConnection(Config.MYSQL);
        this.connection.connect(this._mysqlConnectionHandler.bind(this));

        var query = "SELECT * FROM lolteam.const WHERE name=? LIMIT 1;";
        this.connection.query(query, ['RIOT_API_KEY'], function(err, row, fields) {
            if (!err){
                Config.RIOT.setAPIKey(row[0].value)
                Log(["SERVER", "INIT"], "API key loaded from DB.")
            }
            else
                Log(["SERVER", "INIT", "MYSQL"], err);
        });

        this.listen(Config.SERVER.PORT);
        this._setupRoutes();
    }

    listen(port = Config.SERVER.PORT) {
        var me = this;
        this.app = express();
        // Security
        this.app.disable('x-powered-by');
        // Allowances
        this.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");     // Allow Origin : All
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        this.app.use(cookieParser());                           // Allow cookies
        this.app.use(bodyParser.json());                        // Allow body type : JSON
        this.app.use(bodyParser.urlencoded({ extended:true })); // Allow body type : URL-encoded
        this.app.use(session({
            secret          : Config.SERVER.REDIS.KEY,          // REDIS secret key
            store           : new redisStore({
                client : this.redisClient
            }),
            saveUnitialized : false,
            resave          : false,
            cookie: {
                expires : false,
                maxAge  : 24*60*60*1000 
            }
        }));
        this.app.listen(port, () => {
            Log(["SERVER"],'Server listening on port ' + port);
        });
    } 

    _mysqlConnectionHandler(err) {
        if(err){
            Log(["SERVER","MYSQL"], "Error connecting to database : " + err);
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
        this.app.param('summonerID', function(req, res, next, summonerID) {
            // Check if summonerID is in the pool
            var player = null;
            console.log("clients", me.clientPool);
            for(var i=0;i<me.clientPool.lenght;i++){
                console.log(me.clientPool[i]);
                if(me.clientPool[i].summonerID == summonerID)
                    player = me.clientPool[i];
            }
            if(player != null) {
                req.params.user = player;
                next();
            }
            else {
                req.params.user = null;
                Log(["SERVER", "MatchHistory"],"Summoner (" + summonerID + ") not found. You must be logged to get matchs.");

                // TEMPS
                req.params.user = {id: 1, name: "test", pass: "pass", summonerID: 20066789};
                next();
            }
        });
        //////
        this.app.post("/login",function(req, res) {
            res.set('Content-Type', 'application/json');
            me.dataRoutes.Login(req, res, me.connection, me._loginResultHandler);
        });
        this.app.get("/matchhistory/:summonerID", function(req, res, next) {
            res.set('Content-Type', 'application/json');
            var historyRes = me.dataRoutes.getMatchHistory(req, res, me.connection, me.clientPool);
        });
    }

    _loginResultHandler(user) {
        if(user != 0) {
            this.clientPool.push(user);
            Log(["SERVER", "LOGIN"], user.name.toUpperCase() + ' is now connceted.');
        }
    }
}