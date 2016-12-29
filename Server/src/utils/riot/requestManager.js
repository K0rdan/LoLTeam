// Lib Imports
const async   = require('async');
const fetch   = require('node-fetch');
const url     = require('url');
// Custom Imports
const Log     = require('./../log');
// Logs
const LOGTAGS = ["RIOT", "RequestManager"];

// Debug
const debug = false;

module.exports = class RequestManager {
    constructor() {
        this.lastQuery      = 0;
        this.queryRateLimit = 1000;
        this.queryTimeout   = 10000;
        this.waitingTime    = 10000;
        this.queue          = null;
        this.fetchOptions = {
            timeout: this.queryTimeout
        };

        // Custom binds
        this._fetchErrors       = this._fetchErrors.bind(this);
        this._queueProcess      = this._queueProcess.bind(this);
        this._queueDrain        = this._queueDrain.bind(this);
        this._queuePushRequest  = this._queuePushRequest.bind(this);
        this._queueError        = this._queueError.bind(this);
        
        // Init queue
        this.queue = async.queue(this._queueProcess);
        this.queue.drain = this._queueDrain;
        this.queue.error = this._queueError;
    }

    setQueryRateLimit(queryRateLimit) {
        // Check if the param is a number and expressed in millisecond.
        if(typeof(queryRateLimit) == "number" && queryRateLimit > 1000)
            this.queryRateLimit = queryRateLimit;
    }

    _fetchErrors(err, url, callback) {
        let retry = false, wait = false;

        // If the API returns an error
        if(err.message){
            switch(err.message){
                case "400": // Bad Request
                    Log(LOGTAGS, "Request error : " + err.status + ", " + url);
                    break;
                case "401": // Unauthorized
                    Log(LOGTAGS, "Unauthorized. Missing API_KEY ? " + url);
                    break;
                case "403": // Forbidden
                    Log(LOGTAGS, "Unauthorized. Wrong API_KEY or revoked ? " + url);
                    break;
                case "404": // Team not found
                    Log(LOGTAGS, "Team not found. Wrong team ID ? " + url);
                    break;
                case "429": // Rate limit exceed
                    Log(LOGTAGS, "Request overflow. Waiting 10s..." + url);
                    wait = true;
                    retry = true;
                    break;
                case "500":
                    Log(LOGTAGS, "Riot API error. Retrying...");
                    retry = true;
                    break;
                case "503":
                    Log(LOGTAGS, "Riot API unavailable. Retrying...");
                    retry = true;
                    break;
            }
        }

        err.retry = retry;
        err.wait = wait;
        callback(err, null);
    }

    // QUEUE METHOD HANDLERS
    _queuePushRequest(reqUrl, reqCallback) {
        if(debug)
            console.log("[QUEUE] Pushing request");

        let me = this;
        this.queue.push(reqUrl, function(err, result){
            if(err == null)
                reqCallback(null, result);
            else {
                if(err.retry) {
                    if(err.wait){
                        let startTime = Date.now();
                        setTimeout(function() {
                            if(debug)
                                console.log((Date.now() - startTime) +"ms awaited");
                            
                            me._queuePushRequest(reqUrl, reqCallback);
                        }, me.waitingTime);
                    }
                    else
                        me._queuePushRequest(reqUrl, reqCallback);
                }
                else
                    reqCallback(err, null);
            }
        });
    }
    _queueProcess(reqUrl, callback){
        try{
            if(debug)
                console.log("[QUEUE] Processing request");

            if(this.lastQuery == 0){
                this._queueExecuteRequest(reqUrl, callback);
            }
            else{
                // Do we have to wait ?
                if((Date.now() - this.lastQuery) < this.queryRateLimit){
                    while((Date.now() - this.lastQuery) < this.queryRateLimit);
                    // console.log((Date.now() - this.lastQuery) + "ms awaited");
                    this._queueExecuteRequest(reqUrl, callback);
                }
                else
                    this._queueExecuteRequest(reqUrl, callback);
            }
        }
        catch(e) {
            Log(LOGTAGS, "Error in process : " + e);
        }
    }
    _queueExecuteRequest(reqUrl, callback) {
        if(debug)
            console.log("[QUEUE] Executing request");

        let me = this;
        fetch(url.parse(reqUrl), this.fetchOptions)
        .then(function(response) {
            me.lastQuery = Date.now();
            if(response.ok)
                return response.json();
            else
                throw Error(response.status);
        })
        .then(function(json) {
            if(typeof(callback) == "function")
                callback(null, json);
        })
        .catch(function(e) {
            me._fetchErrors(e, reqUrl, callback);
        });
    }
    _queueError(e, t) {
        // If an option is handled do not show logs on event rised
        if(e.type && this.fetchOptions.timeout && e.type != "request-timeout") {
            Log(LOGTAGS, "Error while processing a request");
            console.log("Description :", e);
        }
    }
    _queueDrain() {
        // Something to do when the queue is empty ?
    }
    // END QUEUE METHOD HANDLERS
}