export default class Log {
    constructor(component, method, msg, options = null) {
        // Init variables
        this.timestamp = false;

        // Init binds
        this._enableTimestamp = this._enableTimestamp.bind(this);
        this._log = this._log.bind(this);

        if(options != null){
            if(options.timestamp == true)
                this._enableTimestamp();
        }

        this._log(component, method, msg);
    }

    _enableTimestamp() { this.timestamp = true; }
    _disableTimestamp() { this.timestamp = false; }

    _getDate() {
        let date = new Date();
        let year = date.getFullYear(),
            month= date.getMonth()+1,
            day  = date.getDate(), 
            hour = date.getHours(),
            min  = date.getMinutes(),
            sec  = date.getSeconds();
        month = month < 9 ? "0"+month : month;

        return year + "/" + (month < 10 ? "0" : "") + month + "/" + (day < 10 ? "0" : "") + day + "-" + (hour < 10 ? "0" : "") + hour + ":" + (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
    }

    _log(component, method, msg) {
        let logStr = "";

        if(this.timestamp)
            logStr += "[" + this._getDate() + "]";

        // Component tag
        logStr += "[" + component + "]";
        // Method tag
        logStr += "[" + (method[0].toUpperCase() + method.slice(1)) + "]";

        console.log(logStr + " " + msg);
    }
};