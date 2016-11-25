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
        this.queryRateLimit = 10000;
        this.queryTimeout   = 10000;
        this.queue          = null;

        // Custom binds
        this._queueProcess      = this._queueProcess.bind(this);
        this._queueDrain        = this._queueDrain.bind(this);
        this._queuePushRequest  = this._queuePushRequest.bind(this);
        this._queueRetryRequest = this._queueRetryRequest.bind(this);
        this.parseRequestErrors = this.parseRequestErrors.bind(this);
        
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

    parseRequestErrors(response, data, callback){
        if(debug)
            console.log("[QUEUE] Parsing error in request's result");

        var waitingTime = 0;
        
        switch(response.status){
            case -1:  // Timeout
                Log(LOGTAGS, "Request timeout : " + data.url);
                if(!data.retries)
                    data.retries    = 1;
                break;
            case 400: // Bad Request
                Log(LOGTAGS, "Request error : " + response.status + ", " + data.url);
                break;
            case 401: // Unauthorized
                Log(LOGTAGS, "Unauthorized. Wrong API_KEY / Revoked ? " + data.url);
                break;
            case 404: // Team not found
                Log(LOGTAGS, "Team not found. Wrong team ID ? " + data.url);
                break;
            case 429: // Rate limit exceed
                Log(LOGTAGS, "Request overflow. Waiting 10s..." + data.url);
                if(!data.retries) {
                    waitingTime = 10000;
                    data.retries     = 1;
                } 
                break;
            case 500:
                Log(LOGTAGS, "Riot API error. Retrying...");
                if(!data.retries)
                    data.retries     = 5;
                break;
            case 503:
                Log(LOGTAGS, "Riot API unavailable. Retrying...");
                if(!data.retries)
                    data.retries     = 5;
                break;
        }

        if(data.retries && data.retries > 0){
            if(data.status)
                delete data.status;
            this._queueRetryRequest(data, callback, waitingTime);
        }
        else {
            if(typeof(callback) == "function")
                callback({ status: "ko", error: response.status });
        }
    }

    // QUEUE METHOD HANDLERS
    _queuePushRequest(reqURL, callback) {
        if(debug)
            console.log("[QUEUE] Pushing request");

        this.queue.push(reqURL, callback);
    }
    _queueProcess(reqURL, callback){
        try{
            if(debug)
                console.log("[QUEUE] Processing request");

            if(this.lastQuery == 0){
                this._queueExecuteRequest(reqURL, callback);
            }
            else{
                // Do we have to wait ?
                if((Date.now() - this.lastQuery) < this.queryRateLimit){
                    while((Date.now() - this.lastQuery) < this.queryRateLimit);
                    console.log((Date.now() - this.lastQuery) + "ms awaited");
                    this._queueExecuteRequest(reqURL, callback);
                }
                else
                    this._queueExecuteRequest(reqURL, callback);
            }
        }
        catch(e) {
            Log(LOGTAGS, "Error in process : " + e);
        }
    }
    _queueExecuteRequest(reqURL, callback) {
        if(debug)
            console.log("[QUEUE] Executing request");

        var me = this;
        fetch(url.parse(reqURL), { timeout: this.queryTimeout})
        .then(function(response) {
            me.lastQuery = Date.now();
            if(response.ok)
                return response.json();
            else{
                // TODO : handling errors
                //me.parseRequestErrors(response, data, callback); 
            }
        })
        .then(function(json) {
            if(typeof(callback) == "function")
                callback({ status: "ok", result: json });
        })
        .catch(function(e) {
            Log(LOGTAGS, e); 
            // TODO : handling errors
            //me.parseRequestErrors(null, data, callback);
        });
    }
    _queueRetryRequest(data, callback, waitingTime=0) {
        if(debug)
            console.log("[QUEUE] Retrying request");

        // TODO : handling errors
        //me.parseRequestErrors(response, data, callback);
    }
    _queueError(e, t) {
        Log(LOGTAGS, "Error while processing a request");
        console.log("Description :", e);
    }
    _queueDrain() {
        // Something to do when the queue is empty ?
    }
    // END QUEUE METHOD HANDLERS
}