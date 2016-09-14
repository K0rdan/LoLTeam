import React from 'react';

var style = {
    container: {}
}

export default class Content extends React.Component {
    componentWillReceiveProps(newProps) {
        if(newProps.menuOpen)
            style.container = {gridColumn: '2'};
        else
            style.container = {gridColumn: '1 / span 2'};
    }

    render() {
        return (<div id="content" style={style.container}>Content</div>);
    }
};