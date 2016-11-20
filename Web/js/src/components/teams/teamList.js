// Lib imports
import React from 'react';

export default class TeamList extends React.Component {
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
                this.state.teams.map(function(team, i) {
                    return (<li key={i}>
                        {team.name}
                    </li>);
                }) : null}
        </ul>);    
    }

    _getTeamsList() {
        var me = this;
        this.props.user.getTeamsList(function(teams) {
            me.setState({teams: teams});
        });
    }
};