module.exports = {
    TYPES: {
        SUMMONERID: {
            LENGTH: 8,
            check: function(summonerID) {
                return new RegExp('^\\d{'+this.LENGTH+'}$').test(summonerID);
            }
        }
    }
};