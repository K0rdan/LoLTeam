// Lib imports
import React from 'react';

export default class Teams extends React.Component {
    constructor(props) {
        super(props);

        // Init binds
        this._getTeamsList = this._getTeamsList.bind(this);

        if(this.props.user)
            this._getTeamsList();
    }

    render() {
        return (<ul>
            {this.state && this.state.teams ? 
                this._displayTeams(teams) : null}
        </ul>);    
    }

    _displayTeams(teams) {
        
        for(var i=0; i<teams.length();i++) {
            
        }
    }

    _getTeamsList() {
        var me = this;
        this.props.user.getTeamsList(function(teams) {
            me.setState({teams: teams});
        });
    }
};