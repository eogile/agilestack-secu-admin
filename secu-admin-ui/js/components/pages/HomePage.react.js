/*
 * HomePage
 * This is the first thing users see of our App
 */

import React, { Component } from 'react';
import { Link } from 'react-router';

class HomePage extends Component {
    render() {
        return (
            <div style={{display: 'flex', justifyContent: 'space-around'}}>
                <Link className="btn" to="/login">Login</Link>
                <Link className="btn" to="/profiles">Profiles</Link>
                <Link className="btn" to="/users">Users</Link>
                <Link className="btn" to="/roles">Roles</Link>
            </div>
        );
    }
}

export default HomePage;
