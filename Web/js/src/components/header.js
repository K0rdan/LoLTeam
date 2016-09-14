import React from 'react';

var style = {
    container: {}
}

export default class Header extends React.Component {
    constructor(){
        super();

        this._openSideMenu = this._openSideMenu.bind(this);
    }

    componentWillReceiveProps(newProps) {
        if(newProps.menuOpen)
            style.container = {gridColumn: '2'};
        else
            style.container = {gridColumn: '1 / span 2'};
    }

    render() {
        return (
            <header onClick={this._openSideMenu} style={style.container}>Header</header>
        );
    }

    // Custom methods
    _openSideMenu() {
        this.props.toggleMenu();
    }

};