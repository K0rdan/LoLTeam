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
        this.queryTimeout   = 100;
        this.queue          = null;
        this.fetchOptions = {
            timeout: this.queryTimeout
        };

        // Custom binds
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

    // QUEUE METHOD HANDLERS
    _queuePushRequest(reqUrl, callback) {
        if(debug)
            console.log("[QUEUE] Pushing request");

        this.queue.push(reqUrl, callback);
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
                callback(response, {status: "ko", message: "Fetch response error", error: response});
        })
        .then(function(json) {
            if(typeof(callback) == "function")
                callback(null, { status: "ok", result: json });
        })
        .catch(function(e) {
            callback(e, {status: "ko", message: "Fetch error", error: e});
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