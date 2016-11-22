// Lib Imports
const express      = require('express');
const session      = require('express-session');
const mysql        = require('mysql');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const redis        = require('redis');
const redisStore   = require('connect-redis')(session);
const _            = require('lodash');

// Custom Imports
const Config     = require('./utils/config');
const Log        = require('./utils/log');

// NOTES :
//  Each route return a JSON response to the client.
//  The JSON response always have a 'status' property. Which can have 'ok' or 'ko' value.
//      - OK : is associate to a 'result' property with the Object or String response.
//      - KO : is associate to a 'error' property a String describing the problem.

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

        Config.RIOT.REQUEST.setQueryRateLimit(500/600 * 1000);
        Log(["SERVER", "INIT"], "API query limiter loaded from DB.");

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
            res.header("Access-Control-Allow-Origin", Config.SERVER.DOMAIN);     // Allow Origin : All
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Credentials", "true");
            next();
        });
        this.app.use(cookieParser());                           // Allow cookies
        this.app.use(bodyParser.json());                        // Allow body type : JSON
        this.app.use(bodyParser.urlencoded({ extended:true })); // Allow body type : URL-encoded
        this.app.use(session({
            secret            : Config.SERVER.REDIS.KEY,          // REDIS secret key
            store             : new redisStore({
                client  : this.redisClient                      // REDIS parameters
            }),
            saveUninitialized : false,                            // No session for unauthorized users
            resave            : false,                            // Disable unmodified session saving
            cookie: {
                domain  : 'server',
                path    : '/',
                httpOnly: true,
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
            Logout: require("./routes/logout"),
            getTeamsList: require("./routes/teams/getTeamsList"),
            getTeamMatchHistory: require("./routes/teams/getTeamMatchHistory"),
            getSummonerID: require("./routes/getSummonerID"),
            getMatchHistory: require("./routes/getMatchHistory")
        };

        var me = this;

        this.app.all('*', function(req, res, next) {
            res.set('Content-Type', 'application/json');
            next();
        });

        this.app.get("/", function(req, res) {
            // TEMP
            console.log(req.session);

            if(req.cookies && req.cookies.lt_user) {
                res.json({status: "ok", message: "You're now connected.", user : req.cookies.lt_user});
            }
            else {
                res.json({status: "ko", message: "No session"});
            }
        });

        // LOGIN
        this.app.post("/login",function(req, res) {
            // TODO : check session before cookie.
            if(!req.cookies.lt_user)
                me.dataRoutes.Login(req, res, me.connection, me._loginResultHandler);
            else
                res.json({status: "ok", message: "You're now connected.", user : req.cookies.lt_user});
        });
        //
        // LOGOUT
        this.app.post("/logout",function(req,res){
            me.dataRoutes.Logout(req, res, me.clientPool);
        });
        //
        // TEAMS LIST
        this.app.get("/teamslist", function(req,res) {
            me.dataRoutes.getTeamsList(req, res, me.connection);
        });
        this.app.get("/teamslist/:userID?", function(req, res) {
            me.dataRoutes.getTeamsList(req, res, me.connection);
        });
        //
        // TEAM MATCH HISTORY
        this.app.get("/teammatchhistory/:teamID", function(req, res) {
            me.dataRoutes.getTeamMatchHistory(req, res, me.connection);
        });
        //
        // MATCH HISTORY
        this.app.get("/matchhistory/:summonerID", function(req, res) {
            me.dataRoutes.getMatchHistory(req, res, me.connection, me.clientPool);
        });
    }

    _loginResultHandler(req, res, user) {
        if(user != 0) {
            //req.session.key = user;
            res.cookie('lt_user', user);
            res.json({status: "ok", message: "You're now connected.", user : user});

            this.clientPool.push(user);
            Log(["SERVER", "LOGIN"], user.name.toUpperCase() + ' is now connected.');
        }
        else
            res.json({status: "ko", message: "Unknown user or identifiants invalid."});
    }
}