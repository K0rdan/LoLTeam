// Lib Imports
const _             = require('lodash');
const async         = require('async');
// Custom Imports
const Config        = require('./../config');
const Log           = require('./../log');
// Logs
const LOGTAGS = ["SERVER", "InsertTeam"];

const debug = true;

module.exports = class insertTeam{
    constructor(teamDetails, mysql) {
        // Init variables
        this.mysql = mysql;

        // Init binds
        

        async.waterfall([
            this.getTeamDetails
        ], function (err, result) {
            
        });
    }

    getTeamDetails(callback) {
        callback(null);
    }
};