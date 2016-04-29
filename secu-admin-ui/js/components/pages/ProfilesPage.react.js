import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dialog } from 'material-ui';

import Profiles from '../Profiles.react';
import Profile from '../Profile.react';
import Policies from '../Policies.react';
import Policy from '../Policy.react';
import { fetchProfiles } from '../../actions/ProfileActions';
import { fetchPolicies } from '../../actions/PolicyActions';

class ProfilesPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            profileId: null,
            policyId: null,
            dialogProfileOpened: false,
            dialogPolicyOpened: false,
        };
    }

    onProfileClick(profile) {
        console.log("onProfileClick", profile);
        this.setState({dialogProfileOpened: true, profileId: profile ? profile.id: null});
    }

    onPolicyClick(policy) {
        console.log("onPolicyClick", policy);
        this.setState({dialogPolicyOpened: true, policyId: policy ? policy.id: null});
    }

    onCloseProfileDialog() {
        const { dispatch } = this.props;
        console.log("onCloseProfileDialog");
        this.setState({dialogProfileOpened: false});
        dispatch(fetchProfiles());
    }

    onClosePolicyDialog() {
        const { dispatch } = this.props;
        console.log("onClosePolicyDialog");
        this.setState({dialogPolicyOpened: false});
        dispatch(fetchPolicies());
    }

    render() {
        const {profileId, policyId, dialogProfileOpened, dialogPolicyOpened} = this.state;

        return (
            <div>
                <Policies onPolicyClick={this.onPolicyClick.bind(this)}/>
                <Dialog title="Policy"
                        modal={false} autoScrollBodyContent={true}
                        open={dialogPolicyOpened}
                        onRequestClose={this.onClosePolicyDialog.bind(this)}>
                    {!dialogPolicyOpened ? null : <Policy policyId={policyId} onGoBack={this.onClosePolicyDialog.bind(this)}/>}
                </Dialog>
            </div>
        );
    }
}

export default connect()(ProfilesPage);
