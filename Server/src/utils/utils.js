module.exports = {
    TYPES: {
        SUMMONERID: {
            LENGTH: 8,
            check: function(summonerID) {
                return new RegExp('^\\d{'+this.LENGTH+'}$').test(summonerID);
            }
        },
        TIMESTAMP: {
            LENGTH: 13,
            check: function(timestamp) {
                return new RegExp('^\\d{'+this.LENGTH+'$').test(timestamp);
            },
            toMilliSecond: function(timestamp) {
                if(timestamp && timestamp.length == 10) {
                    if(typeof(timestamp) == "number")
                        return timestamp * 1000;
                    if(typeof(timestamp) == "string")
                        return parsetInt(timestamp) * 1000;

                    return null;
                }
                else 
                    return null;
            }
        }
    }
};