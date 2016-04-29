import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { TextField, FlatButton, Snackbar, SelectField, MenuItem } from 'material-ui';
import Select from 'react-select'

import 'react-select/dist/react-select.css';

import { fetchPolicyIfNeeded, updatePolicyDescription, updatePolicyResource, updatePolicyUsers, updatePolicyPermissions, deletePolicy, saveNewPolicy, clearPolicyError } from '../actions/PolicyActions';
import { fetchUsersIfNeeded } from '../actions/UserActions';
import { fetchResourcesIfNeeded } from '../actions/ResourceActions';

function buildState(policy) {
    var description , permissions;
    if (policy && policy.data) {
        description = policy.data.description;
        permissions = policy.data.permissions;
    }
    return {description, permissions};
}

function getResourceByKey(key, resources) {
  console.log('beginning of getResourceByKey, resources.data : ', resources.data);
  var resource;
  for (var res of resources.data) {
    console.log("getResourceByKey "+ res.key + " : "+res.security_key);
    if (res && res.key && res.key === key) {
      resource = res;
      break;
    }
  }
  // if (!resource) {
  //   resource = {key:'undefined', permissions:[]}
  // }
  resource.permissionsTranslated = [];
  // var perms = [];

  resource.permissionsTranslated = resource.permissions.map(perm => {return {label:perm, value:perm}});
  return resource;
}


class Policy extends Component {

    constructor(props) {
        super(props);
        this.state = buildState(props.policy);
    }

    componentWillReceiveProps(props) {
        var policy = props.policy;
        this.setState(buildState(policy));
        const resource = {key:'', permissions:[], permissionsTranslated:[]};
        console.log('resources in componentWillReceiveProps: ', props.resources);
        console.log('emptyresource: ', resource);
        if (props && policy && policy.data && policy.data.key &&props.resources) {
          this.setState(getResourceByKey(policy.data.key, props.resources));
        } else {
          console.log('in componentWillReceiveProps, new Policy ');
          this.setState({resource});
        }
    }

    componentWillMount() {
        const { dispatch, policyId } = this.props;
        dispatch(fetchPolicyIfNeeded(policyId));
        dispatch(fetchUsersIfNeeded());
        dispatch(fetchResourcesIfNeeded());
    }

    onChangeDescription(e) {
        const description = e.target.value;
        console.log('onChangeDescription', description);
        this.setState({description})
    }

    onBlurDescription(e) {
        const { dispatch, policy } = this.props;
        const description = e.target.value;
        console.log('onBlurDescription', description);
        if (description != policy.data.description) {
            dispatch(updatePolicyDescription(policy.id, description));
        }
    }

    onChangeResource(event, index, value) {
        var resource;
        resource = getResourceByKey(value, this.props.resources);
        console.log('onChangeResource', resource);
        this.setState({resource});
    }
    // handleChange = (event, index, value) => this.setState({value});

    onBlurResource(e) {
        const { dispatch, policy } = this.props;
        const resource = e.target.value;
        console.log('onBlurResource', resource);
        if (resource != policy.data.resource) {
            dispatch(updatePolicyResource(policy.id, resource));
        }
    }

    onChangeUsers(users) {
        const { dispatch, policy } = this.props;
        users = users || [];
        console.log('onChangeUsers', users);
        dispatch(updatePolicyUsers(policy.id, users.map(user => user.id)));
    }

    onChangePermissions(permissions) {
        const { dispatch, policy } = this.props;
        permissions = permissions || [];
        console.log('onChangePermissions', permissions);
        dispatch(updatePolicyPermissions(policy.id, permissions.map(role => role.id)));
    }

    onDelete() {
        const { dispatch, policy, onGoBack } = this.props;
        console.log('onDelete');
        dispatch(deletePolicy(policy.id));
        if (onGoBack) {
            onGoBack();
        }
    }

    onSaveNew() {
        const { dispatch, policy } = this.props;
        console.log('onSaveNew');
        dispatch(saveNewPolicy(policy.data));
    }

    onCloseSnackbar() {
        const { dispatch, policy } = this.props;
        dispatch(clearPolicyError(policy.id))
    }

    render() {
        // console.log('Policy.render', this.props);
        const { policy, users, resources } = this.props;
        const { description, resource } = this.state;
        console.log(' in Policy render, resource: ', resource);
        // console.log('resources: ', resources);
        var resourceKey = 'undefined';
        if (resource) {
          resourceKey = resource.key;
        }

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
        var resElements = [];
        resElements = resources.data.map(res => <MenuItem key={res.key} value={res.key} primaryText={res.key}/>);
        //TODO why below not working ?
        // resource.permissionsTranslated = resource.permissions.map(perm => {label: perm, value: perm});
        // var perms = [];
        //
        // for (var perm of resources.permissions) {
        //   console.log("permissions of resource : "+ perm);
        //   // console.log("<MenuItem key="+res.key+" value="+res.security_key+" primaryText="+res.key+"/>");
        //   perms.push({label: perm, value: perm});
        // }
        // resources.permissionsTranslated = perms;


        // for (var res of resources.data) {
        //   // console.log("resource to render in menu ",res);
        //   console.log("policy render resource list creation, for "+ res.key);
        //   // console.log("<MenuItem key="+res.key+" value="+res.security_key+" primaryText="+res.key+"/>");
        //   resElements.push(<MenuItem key={res.key} value={res.key} primaryText={res.key}/>);
        // }
        return !policy.loaded ? (
            <div>Loading policy...</div>
        ) : (
            <div>
                <TextField
                    floatingLabelText="Description"
                    value={description}
                    onChange={this.onChangeDescription.bind(this)}
                    onBlur={this.onBlurDescription.bind(this)}/><br/>
                <SelectField
                    value={resourceKey}
                    onChange={this.onChangeResource.bind(this)}
                    floatingLabelText="Select a resource to secure">
                  {resElements}
                </SelectField>
                <div style={styles.selectContainer}>
                    <label style={styles.selectLabel}>Permissions</label>
                    <Select
                        multi={true}
                        value={policy.data.permissions}
                        options={(resource)?resource.permissionsTranslated:[]}
                        onChange={this.onChangePermissions.bind(this)}/>
                </div>
                <div style={styles.selectContainer}>
                    <label style={styles.selectLabel}>Users</label>
                    <Select
                        multi={true}
                        value={policy.data.subjects}
                        options={users.data}
                        valueKey="id"
                        labelKey="login"
                        onChange={this.onChangeUsers.bind(this)}/>
                </div>
                <div style={styles.actionBar}>
                    {policy.id ?
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
                    open={!!policy.error}
                    message={policy.error}
                    autoHideDuration={3000}
                    onRequestClose={this.onCloseSnackbar.bind(this)}/>
            </div>
        );
    }

}

Policy.propTypes = {
    policyId: PropTypes.string,
    onGoBack: PropTypes.func,
};

export default connect(state => ({
    policy: state.policy,
    users: state.users,
    resources: state.resources,
}))(Policy);
