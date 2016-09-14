// Lib imports
import React from 'react';
import ReactDOM from 'react-dom';
 
// Custome imports
import Header from './components/header';
import SideMenu from './components/sidemenu';
import Content from './components/content';

class App extends React.Component {
    constructor(){
        super();

        // Init state
        this.state = {
            isSideMenuOpen: false
        };

        // Init binds
        this._toggleSideMenu = this._toggleSideMenu.bind(this);
    }

    render() {
        return (
            <div id="grid">
                <Header toggleMenu={this._toggleSideMenu} menuOpen={this.state.isSideMenuOpen}/>
                <SideMenu menuOpen={this.state.isSideMenuOpen}/>
                <Content menuOpen={this.state.isSideMenuOpen}/>
            </div>
        );
    }

    // Custom methods
    _toggleSideMenu() {
        this.setState({isSideMenuOpen: !this.state.isSideMenuOpen});
    }
}
 
ReactDOM.render(<App />, document.getElementById('main'));