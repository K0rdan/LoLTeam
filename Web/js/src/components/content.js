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

        this.user = this.props.user;
    }

    componentWillReceiveProps(newProps) {
        if(newProps.menuOpen)
            style.container = {gridColumn: '2'};
        else
            style.container = {gridColumn: '1 / span 2'};
    }

    render() {
        if(this.user.getId() != null)
            return (<div id="content" style={style.container}>Content</div>);
        else
            return (<div id="content" style={style.container}><Login user={this.props.user}/></div>);
    }
};