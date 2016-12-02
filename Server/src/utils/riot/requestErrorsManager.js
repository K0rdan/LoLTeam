// Lib Imports
const _       = require('lodash');
// Custom Imports
const Log     = require('./../log');

const LOGTAGS = ["SERVER", "RequestError"];

var retries = null, waitingTime = 0;

module.exports = function RequestErrorsManager (route, data, err, callback){
    // If a custom error is returned
    if(err.type){
        switch(err.type){
            case "request-timeout":
                if(retries == null)
                    retries    = 1;
                if(retries == 0)
                    Log(_.concat(LOGTAGS, route), "Request timeout : " + data.url);
                break;
        }
    }

    // If the API returns an error
    if(err.status){
        switch(err.status){
            case 400: // Bad Request
                Log(LOGTAGS, "Request error : " + err.status + ", " + data.url);
                break;
            case 401: // Unauthorized
                Log(LOGTAGS, "Unauthorized. Wrong API_KEY / Revoked ? " + data.url);
                break;
            case 404: // Team not found
                Log(LOGTAGS, "Team not found. Wrong team ID ? " + data.url);
                break;
            case 429: // Rate limit exceed
                Log(LOGTAGS, "Request overflow. Waiting 10s..." + data.url);
                let startTime = Date.now();
                setTimeout(function() {
                    console.log((Date.now() - startTime) +"ms awaited");
                }, 10000);
                break;
            case 500:
                Log(LOGTAGS, "Riot API error. Retrying...");
                if(retries == null)
                    retries     = 5;
                break;
            case 503:
                Log(LOGTAGS, "Riot API unavailable. Retrying...");
                if(retries == null)
                    retries     = 5;
                break;
        }
    } 

    if(retries > 0){
        retries--;
        callback(data.url);
    }
    else {
        let errMsg = null;
        if(err.type)
            errMsg = err.type;
        if(err.status)
            errMsg = err.status;

        if(data.res)
            data.res.json({ status: "ko", error: errMsg });
    }
}