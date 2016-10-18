// Lib imports
import React from 'react';

// Custom imports
import Login from './login';

var style = {
    container: {}
}

export default class Content extends React.Component {
    constructor(props){
        super(props);

        // Init vars
        this.user = this.props.user;

        // Init state
        this.state = {
            connected: false
        };

        // Init binds
        this._onLogin = this._onLogin.bind(this);
    }

    componentWillReceiveProps(newProps) {
        if(newProps.menuOpen)
            style.container = {gridColumn: '2'};
        else
            style.container = {gridColumn: '1 / span 2'};
    }

    _onLogin() {
        if(this.user.getId())
            this.setState({ connected:true });
    }

    render() {
        if(this.user.getId() != null)
            return (<div id="content" style={style.container}>Content</div>);
        else
            return (<div id="content" style={style.container}><Login user={this.props.user} onLogin={this._onLogin}/></div>);
    }
};