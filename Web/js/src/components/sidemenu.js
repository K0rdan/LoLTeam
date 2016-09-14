import React from 'react';

export default class SideMenu extends React.Component {
    render() {
        if(this.props.menuOpen)
            return (<aside>Menu</aside>);
        else
            return null;
    }
};