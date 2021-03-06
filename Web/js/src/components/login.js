// Lib imports
import React from 'react';

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        // Init binds
        this._login = this._login.bind(this);

        this._restoreSession();
    }

    render() {
        return (<div onClick={this._login}>Log me</div>);    
    }

    _restoreSession() {
        var me = this;
        this.props.user.restoreSession(function() {
            if(me.props.onLogin)
                me.props.onLogin();
        });
    }

    _login() {
        // TEMP : use form values instead of forced values
        var username = '0Kordan0';
        var password = 'pass';

        var me = this;
        this.props.user.login(username, password, function() {
            if(me.props.onLogin)
                me.props.onLogin();
        });
    }
};