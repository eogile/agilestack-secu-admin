/**
 *
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import Logo from "../../img/AgileStack_transparent_logo.png";
import {Avatar, FlatButton, NavigationExpandMoreIcon, Toolbar, ToolbarGroup} from "material-ui";
import {push} from "react-router-redux";
import {logout} from 'agilestack-login-ui';

function initials(currentUser) {
  let initials = '';
  if (!currentUser) {
    return initials;
  }
  if (currentUser.firstName) {
    initials += currentUser.firstName.charAt(0);
  }
  if (currentUser.lastName) {
    initials += currentUser.lastName.charAt(0);
  }
  if (initials == '' && currentUser.login) {
    initials = currentUser.login.substr(0, 2);
  }
  initials = initials.toUpperCase();
  console.log('initials', currentUser, initials);
  return initials;
}

class App extends Component {

  constructor(props) {
    super(props);
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
  }

  onLogin() {
    console.log("this.props in handleLogin : ", this.props);
    const {dispatch, routing} = this.props;

    console.log(routing.locationBeforeTransitions);
    dispatch(push('/login?callback='+encodeURI(routing.locationBeforeTransitions.pathname)));
  }

  onLogout() {
    console.log('logout');
    const {dispatch} = this.props;
    dispatch(logout());
  }

  render() {
    const {currentUser} = this.props;
    return (
      <div className="wrapper">
        <Toolbar>
          <ToolbarGroup firstChild={true} float="left">
            <img className="logo" src={Logo} />
          </ToolbarGroup>
          <ToolbarGroup float="right">
            {currentUser.loggedIn ? (
              <Avatar style={{marginTop: '10'}} onTouchTap={this.onLogout}>
                {initials(currentUser.user)}
              </Avatar>
            ) : (
              <FlatButton label="Sign in" primary={true} onTouchTap={this.onLogin}/>
            )}
          </ToolbarGroup>
        </Toolbar>
        {this.props.children}
      </div>
    );
  }
}

// REDUX Wrap the component to inject dispatch and state into it
export default connect(state => ({
  routing: state.routing,
  currentUser: state.currentUser
}))(App);
