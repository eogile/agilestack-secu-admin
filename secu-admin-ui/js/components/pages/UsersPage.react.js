import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dialog } from 'material-ui';

import Users from '../Users.react';
import User from '../User.react';
import { fetchUsers } from '../../actions/UserActions';

class UsersPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userId: null,
            dialogOpened: false,
        };
    }

    onUserClick(user) {
        console.log("onUserClick", user);
        this.setState({dialogOpened: true, userId: user ? user.id: null});
    }

    onCloseDialog() {
        const { dispatch } = this.props;
        console.log("onCloseDialog");
        this.setState({dialogOpened: false});
        dispatch(fetchUsers());
    }

    render() {
        const {userId, dialogOpened} = this.state;

        return (
            <div>
                <Users onUserClick={this.onUserClick.bind(this)}/>
                <Dialog title="User"
                        modal={false} autoScrollBodyContent={true}
                        open={dialogOpened}
                        onRequestClose={this.onCloseDialog.bind(this)}>
                    {!dialogOpened ? null : <User userId={userId} onGoBack={this.onCloseDialog.bind(this)}/>}
                </Dialog>
            </div>
        );
    }
}

export default connect(state => ({
}))(UsersPage);
