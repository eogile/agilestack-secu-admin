/*
 * HomePage
 * This is the first thing users see of our App
 */

import React, {Component} from 'react';
import {Link} from 'react-router';
import {connect} from "react-redux";

class HomePage extends Component {

  render() {
    const {currentUser, routing} = this.props;
    return (
      <div style={{display: 'flex', justifyContent: 'space-around'}}>
        <Link className="btn" to={{pathname:'/login', query:{callback: routing.locationBeforeTransitions.pathname}}}>Login</Link>
        <Link className="btn" to="/profiles">Profiles</Link>
        {currentUser.loggedIn && <Link className="btn" to="/users">Users</Link>}
        {currentUser.loggedIn && <Link className="btn" to="/roles">Roles</Link>}
      </div>
    );
  }
}

export default connect(state => ({
  routing: state.routing,
  currentUser: state.currentUser
}))(HomePage);
