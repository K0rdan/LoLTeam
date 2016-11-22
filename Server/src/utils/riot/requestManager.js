// Lib Imports
const async   = require('async');
const fetch   = require('node-fetch');
const url     = require('url');
// Custom Imports
const Log     = require('./../log');
// Logs
const LOGTAGS = ["RIOT", "RequestManager"];

module.exports = class RequestManager {
    constructor() {
        this.lastQuery      = 0;
        this.queue          = null;
        this.queryRateLimit = null;

        // Custom binds
        this._processQueue  = this._processQueue.bind(this);
        this._drainQueue    = this._drainQueue.bind(this);
        this._executeRequest= this._executeRequest.bind(this);
        //
        
        this.queue = async.queue(this._processQueue);
        this.queue.drain = this._drainQueue;
    }

    setQueryRateLimit(queryRateLimit) {
        // Check if the param is a number and expressed in millisecond.
        if(typeof(queryRateLimit) == "number" && queryRateLimit > 1000)
            this.queryRateLimit = queryRateLimit;
    }

    pushRequest(reqURL, callback) {
        this.queue.push(reqURL, callback); 
    }

    _processQueue(reqURL, callback){
        try{
            if(this.lastQuery == 0){
                this._executeRequest(reqURL, callback);
            }
            else{
                let now = Date.now();
                if(this.queryRateLimit != null && (now - this.lastQuery) < this.queryRateLimit){
                    while((now - this.lastQuery) < this.queryRateLimit);
                    //console.log((Date.now() - lastQuery) + "ms awaited");
                    this._executeRequest(reqURL, callback);
                }
            }
        }
        catch(e) {
            Log(LOGTAGS, e.message);
            callback({ status: "ko", error: "Queue error" });
        }
    }

    _drainQueue() {
        // Something to do when the queue is empty ?
        Log(LOGTAGS, "Requests' queue is now empty");
    }

    _executeRequest(reqURL, callback) {
        var me = this;
        fetch(url.parse(reqURL))
        .then(function(response) {
            me.lastQuery = Date.now();
            if(response.ok)
                return response.json();
        })
        .then(function(json) {
            callback({ status: "ok", result: json });
        })
        .catch(function(e) {
            Log(LOGTAGS, e.message);
            callback({ status: "ko", error: "Fetch error" });
        });
    }
}