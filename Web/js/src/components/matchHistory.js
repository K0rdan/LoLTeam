// Lib imports
import React from 'react';

export default class MatchHistory extends React.Component {
    constructor() {
        super();

        this.setState = {
            matchs: null
        };

        // Init binds
        this._getMatchHistory = this._getMatchHistory.bind(this);
        this._getMatchHistory();
    }

    render() {
        return (<div>
            History
        </div>);    
    }

    _getMatchHistory() {
        console.log("GetMatchHistory");
        /*this.props.user.getMatchHistory(function(matchs) {
            console.log("Callback getMatchHistory", matchs);
        });*/
    }
};