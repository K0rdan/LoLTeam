// Lib imports
import React from 'react';

export default class Login extends React.Component {
    constructor() {
        super();

        // Init binds
        this._login = this._login.bind(this);
    }

    render() {
        return (<div onClick={this._login}>Log me</div>);    
    }

    _login() {
        // TEMP : use form values instead of forced values
        var username = 'test';
        var password = 'test';

        this.props.user.login(username, password);
    }
};