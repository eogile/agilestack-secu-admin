import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TextField, FlatButton, Snackbar } from 'material-ui';
import Select from 'react-select'

import 'react-select/dist/react-select.css';

import { fetchProfileIfNeeded, updateProfileDescription, updateProfileUsers, updateProfileRoles, deleteProfile, saveNewProfile, clearProfileError } from '../actions/ProfileActions';
import { fetchUsersIfNeeded } from '../actions/UserActions';
import { fetchRolesIfNeeded } from '../actions/RoleActions';

function buildState(profile) {
    var description;
    if (profile && profile.data) {
        description = profile.data.description;
    }
    return {description};
}

class Profile extends Component {

    constructor(props) {
        super(props);
        this.state = buildState(props.profile);
    }

    componentWillReceiveProps(props) {
        this.setState(buildState(props.profile));
    }

    componentWillMount() {
        const { dispatch, profileId } = this.props;
        dispatch(fetchProfileIfNeeded(profileId));
        dispatch(fetchUsersIfNeeded());
        dispatch(fetchRolesIfNeeded());
    }

    onChangeDescription(e) {
        const description = e.target.value;
        console.log('onChangeDescription', description);
        this.setState({description})
    }

    onBlurDescription(e) {
        const { dispatch, profile } = this.props;
        const description = e.target.value;
        console.log('onBlurDescription', description);
        if (description != profile.data.description) {
            dispatch(updateProfileDescription(profile.id, description));
        }
    }

    onChangeUsers(users) {
        const { dispatch, profile } = this.props;
        users = users || [];
        console.log('onChangeUsers', users);
        dispatch(updateProfileUsers(profile.id, users.map(user => user.id)));
    }

    onChangeRoles(roles) {
        const { dispatch, profile } = this.props;
        roles = roles || [];
        console.log('onChangeRoles', roles);
        dispatch(updateProfileRoles(profile.id, roles.map(role => role.id)));
    }

    onDelete() {
        const { dispatch, profile, onGoBack } = this.props;
        console.log('onDelete');
        dispatch(deleteProfile(profile.id));
        if (onGoBack) {
            onGoBack();
        }
    }

    onSaveNew() {
        const { dispatch, profile } = this.props;
        console.log('onSaveNew');
        dispatch(saveNewProfile(profile.data));
    }

    onCloseSnackbar() {
        const { dispatch, profile } = this.props;
        dispatch(clearProfileError(profile.id))
    }

    render() {
        // console.log('Profile.render', this.props);
        const { profile, users, roles } = this.props;
        const { description } = this.state;

        const styles = {
            selectContainer: {
                marginTop: 14,
            },
            selectLabel: {
                fontSize: 12,
                opacity: 0.5,
            },
            actionBar: {
                marginTop: 32,
                display: 'flex',
                justifyContent: 'space-between',
            },
        };

        return !profile.loaded ? (
            <div>Loading profile...</div>
        ) : (
            <div>
                <TextField
                    floatingLabelText="Description"
                    value={description}
                    onChange={this.onChangeDescription.bind(this)}
                    onBlur={this.onBlurDescription.bind(this)}/><br/>
                <div style={styles.selectContainer}>
                    <label style={styles.selectLabel}>Roles</label>
                    <Select
                        multi={true}
                        value={profile.data.roles}
                        options={roles.data}
                        valueKey="id"
                        labelKey="description"
                        onChange={this.onChangeRoles.bind(this)}/>
                </div>
                <div style={styles.selectContainer}>
                    <label style={styles.selectLabel}>Users</label>
                    <Select
                        multi={true}
                        value={profile.data.users}
                        options={users.data}
                        valueKey="id"
                        labelKey="login"
                        onChange={this.onChangeUsers.bind(this)}/>
                </div>
                <div style={styles.actionBar}>
                    {profile.id ?
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
                    open={!!profile.error}
                    message={profile.error}
                    autoHideDuration={3000}
                    onRequestClose={this.onCloseSnackbar.bind(this)}/>
            </div>
        );
    }

}

Profile.propTypes = {
    profileId: PropTypes.string,
    onGoBack: PropTypes.func,
};

export default connect(state => ({
    profile: state.profile,
    users: state.users,
    roles: state.roles,
}))(Profile);
