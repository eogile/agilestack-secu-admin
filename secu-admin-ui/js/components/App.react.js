/**
 *
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import Logo from '../../img/AgileStack_transparent_logo.png';
import {
        Avatar,
        DropDownMenu,
        FlatButton,
        FontIcon,
        IconMenu,
        IconButton,
        List,
        ListItem,
        MenuItem,
        NavigationExpandMoreIcon,
        Toolbar,
        ToolbarGroup,
        ToolbarSeparator,
        ToolbarTitle,
      } from 'material-ui';
import { Link } from 'react-router';
import { push } from 'react-router-redux';
import { loginSuccess } from 'agilestack-login-ui/lib';

class App extends Component {

  handleLogin() {
    console.log("this.props in handleLogin : ", this.props);
    const { dispatch} = this.props;
    const { routing } = this.props.data;

    console.log(routing.locationBeforeTransitions);
    dispatch(push('/login?callback='+encodeURI(routing.locationBeforeTransitions.pathname)));
  }

  componentWillMount () {
    const { dispatch} = this.props;
    //check if authentified to change state
    var tokenInfoString = localStorage.getItem('tokenInfo');
    if (tokenInfoString) {
      dispatch(loginSuccess(JSON.parse(tokenInfoString)));
    }


  }

  render() {
    console.log("this.props.data", this.props.data);
    const {login } = this.props.data;
    console.log(login.loggedin);
    var rightToolbarElement;
    if (login.loggedin) {
      rightToolbarElement = <Avatar style={{
                                            marginTop: '10'
                                          }}>
                              JL
                            </Avatar>;
    } else {
      rightToolbarElement =
          <FlatButton label="Sign in" primary={true} onTouchTap={this.handleLogin.bind(this)}/>;
    }
    return (
      <div className="wrapper">
        <Toolbar>
          <ToolbarGroup firstChild={true} float="left">
            <img className="logo" src={Logo} />
          </ToolbarGroup>
          <ToolbarGroup float="right">
            {rightToolbarElement}
          </ToolbarGroup>
        </Toolbar>
        {this.props.children}
      </div>
    );
  }
}

// REDUX STUFF

// Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state
  };
}

// Wrap the component to inject dispatch and state into it
export default connect(select)(App);
