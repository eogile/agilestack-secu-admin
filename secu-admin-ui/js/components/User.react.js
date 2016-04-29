import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TextField, FlatButton, Snackbar } from 'material-ui';
import Select from 'react-select'

import 'react-select/dist/react-select.css';

import { fetchUserIfNeeded, updateUserName, deleteUser, saveNewUser, clearUserError } from '../actions/UserActions';

function buildState(user) {
    var login, firstName, lastName;
    if (user && user.data) {
        login = user.data.login;
        firstName = user.data.firstName;
        lastName = user.data.lastName;
    }
    return {login, firstName, lastName};
}

class User extends Component {

    constructor(props) {
        super(props);
        this.state = buildState(props.user);
    }

    componentWillReceiveProps(props) {
        this.setState(buildState(props.user));
    }

    componentWillMount() {
        const { dispatch, userId } = this.props;
        dispatch(fetchUserIfNeeded(userId));
    }

    onChangeFirstName(e) {
        const firstName = e.target.value;
        console.log('onChangeFirstName', firstName);
        this.setState({firstName})
    }

    onBlurFirstName(e) {
        const { dispatch, user } = this.props;
        const { lastName } = this.state;
        const firstName = e.target.value;
        console.log('onBlurFirstName', firstName);
        if (firstName != user.data.firstName) {
            dispatch(updateUserName(user.id, firstName, lastName));
        }
    }

    onChangeLastName(e) {
        const lastName = e.target.value;
        console.log('onChangeLastName', lastName);
        this.setState({lastName})
    }

    onBlurLastName(e) {
        const { dispatch, user } = this.props;
        const { firstName } = this.state;
        const lastName = e.target.value;
        console.log('onBlurLastName', firstName);
        if (lastName != user.data.lastName) {
            dispatch(updateUserName(user.id, firstName, lastName));
        }
    }

    onChangeLogin(e) {
        const login = e.target.value;
        console.log('onChangeLogin', login);
        this.setState({login})
    }

    onChangePassword(e) {
        const password = e.target.value;
        console.log('onChangePassword');
        this.setState({password})
    }

    onDelete() {
        const { dispatch, user, onGoBack } = this.props;
        console.log('onDelete');
        dispatch(deleteUser(user.id));
        if (onGoBack) {
            onGoBack();
        }
    }

    onSaveNew() {
        const { dispatch } = this.props;
        const { login, password, firstName, lastName } = this.state;
        console.log('onSaveNew');
        dispatch(saveNewUser({ login, password, firstName, lastName }));
    }

    onCloseSnackbar() {
        const { dispatch, user } = this.props;
        dispatch(clearUserError(user.id))
    }

    render() {
        // console.log('User.render', this.props);
        const { user } = this.props;
        const { login, password, firstName, lastName } = this.state;

        const styles = {
            fieldset: {
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginLeft: -10,
                marginRight: -10,
            },
            field: {
                minWidth: 256,
                flex: 1,
                marginLeft: 10,
                marginRight: 10,
            },
            bigField: {
                width: '100%',
                marginLeft: 10,
                marginRight: 10,
            },
            selectContainer: {
                marginTop: 14,
            },
            selectLabel: {
                fontSize: 12,
                opacity: 0.5,
            },
            actionBar: {
                width: '100%',
                marginTop: 32,
                display: 'flex',
                justifyContent: 'space-between',
            },

        };

        return !user.loaded ? (
            <div>Loading user...</div>
        ) : (
            <div style={styles.fieldset}>
                {!!user.id ?
                    <TextField
                        style={styles.bigField}
                        floatingLabelText="Email"
                        value={login}
                        disabled={true}/> :
                    [
                        <TextField
                            key="login"
                            style={styles.field}
                            floatingLabelText="Email"
                            value={login}
                            onChange={this.onChangeLogin.bind(this)}/>,
                        <TextField
                            key="password"
                            style={styles.field}
                            floatingLabelText="Password"
                            type="password"
                            value={password}
                            onChange={this.onChangePassword.bind(this)}/>
                    ]}
                <TextField
                    style={styles.field}
                    floatingLabelText="First name"
                    value={firstName}
                    onChange={this.onChangeFirstName.bind(this)}
                    onBlur={this.onBlurFirstName.bind(this)}/>
                <TextField
                    style={styles.field}
                    floatingLabelText="Last name"
                    value={lastName}
                    onChange={this.onChangeLastName.bind(this)}
                    onBlur={this.onBlurLastName.bind(this)}/>

                <div style={styles.actionBar}>
                    {user.id ?
                        <FlatButton
                            label="Delete"
                            secondary={true}
                            onTouchTap={this.onDelete.bind(this)}
                            /> :
                        <FlatButton
                            label="Create"
                            primary={true}
                            onTouchTap={this.onSaveNew.bind(this)}
                            />
                    }
                </div>
                <Snackbar
                    open={!!user.error}
                    message={user.error}
                    autoHideDuration={3000}
                    onRequestClose={this.onCloseSnackbar.bind(this)}/>
            </div>
        );
    }

}

User.propTypes = {
    userId: PropTypes.string,
    onGoBack: PropTypes.func,
};

export default connect(state => ({
    user: state.user,
}))(User);
