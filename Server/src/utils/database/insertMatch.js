// Lib Imports
const _             = require('lodash');
const async         = require('async');
// Custom Imports
const Config        = require('./../config');
const Log           = require('./../log');
// Logs
const LOGTAGS = ["SERVER", "InsertMatch"];

module.exports = class insertMatch{
    constructor(teamID, mysql, matchDetails) {
        // Init variables
        this.mysql = mysql;

        // Init binds
        
        console.log(arguments);
        /*async.waterfall([
            
        ], function (err, result) {
            
        });*/
    }
};