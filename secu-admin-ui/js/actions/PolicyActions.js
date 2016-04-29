import fetch from 'isomorphic-fetch';

import {
    POLICIES_LOAD_REQUEST,
    POLICIES_LOAD_SUCCESS,
    POLICIES_LOAD_ERROR,
    POLICY_LOAD_REQUEST,
    POLICY_LOAD_SUCCESS,
    POLICY_CREATE_REQUEST,
    POLICY_UPDATE_DESC_REQUEST,
    POLICY_UPDATE_USERS_REQUEST,
    POLICY_UPDATE_ROLES_REQUEST,
    POLICY_ERROR,
    POLICY_CLEAR_ERROR,
    API_POLICIES_URL,
    API_POLICY_URL,
    API_POLICY_DESC_URL,
    API_POLICY_RES_URL,
    API_POLICY_USERS_URL,
    API_POLICY_ROLES_URL,
} from '../constants/AppConstants';

import { doFetchWithAuth } from './authActionsUtils';

function requestPolicies() {
    console.log('requestPolicies');
    return {
        type: POLICIES_LOAD_REQUEST,
    };
}

function receivePolicies(json) {
    console.log('receivePolicies');
    return {
        type: POLICIES_LOAD_SUCCESS,
        data: json,
    };
}

function errorPolicies(error) {
    console.log('errorPolicies');
    return {
        type: POLICIES_LOAD_ERROR,
        data: error,
    }
}

export function fetchPolicies() {
    return dispatch => {
        console.log('fetchPolicies');
        dispatch(requestPolicies());

        doFetchWithAuth(API_POLICIES_URL)
            .then(json => dispatch(receivePolicies(json)))
            .catch(err => dispatch(errorPolicies(err)));
    };
}

function isPoliciesLoaded(globalState) {
    console.log('isPoliciesLoaded');
    return globalState.policies && globalState.policies.loaded;
}

export function fetchPoliciesIfNeeded() {
    return (dispatch, getState) => {
        console.log('fetchPoliciesIfNeeded');
        if (isPoliciesLoaded(getState())) {
            return;
        }
        return dispatch(fetchPolicies());
    }
}



function requestPolicy(id) {
    console.log('requestPolicy', id);
    return {
        type: POLICY_LOAD_REQUEST,
        id,
    };
}

function receivePolicy(json, id) {
    console.log('receivePolicy');
    return {
        type: POLICY_LOAD_SUCCESS,
        data: json,
        id,
    };
}

function errorPolicy(error, id) {
    console.log('errorPolicy', error);
    return {
        type: POLICY_ERROR,
        data: error,
        id,
    }
}

export function clearPolicyError(id) {
    console.log('clearPolicyError');
    return {
        type: POLICY_CLEAR_ERROR,
        id,
    }
}

function createPolicy() {
    console.log('createPolicy');
    return {
        type: POLICY_CREATE_REQUEST,
    }
}

function fetchPolicy(id) {
    return dispatch => {
        console.log('fetchPolicy');
        dispatch(requestPolicy(id));

        doFetchWithAuth(API_POLICY_URL.replace("{0}", id))
            .then(json => dispatch(receivePolicy(json, id)))
            .catch(err => dispatch(errorPolicy(err, id)));
    };
}

function isPolicyLoaded(globalState, id) {
    console.log('isPolicyLoaded');
    return globalState.policy && globalState.policy.loaded && globalState.policy.id == id;
}

export function fetchPolicyIfNeeded(id) {
    return (dispatch, getState) => {
        console.log('fetchPolicyIfNeeded');
        if (!id) {
            return dispatch(createPolicy());
        } else if (isPolicyLoaded(getState(), id)) {
            return;
        }
        return dispatch(fetchPolicy(id));
    }
}

function updateNewPolicyDescription(description) {
    console.log('updateNewPolicyDescription');
    return {
        type: POLICY_UPDATE_DESC_REQUEST,
        data: description,
    };
}

export function updatePolicyDescription(id, description) {
    return dispatch => {
        console.log('updatePolicyDescription', id, description);
        if (!id) {
            return dispatch(updateNewPolicyDescription(description));
        }

        dispatch(requestPolicy(id)); // loading = true

        doFetchWithAuth(API_POLICY_DESC_URL.replace("{0}", id), {
            method: 'PUT',
            body: JSON.stringify(description),
        })
            .then(() => dispatch(fetchPolicy(id))) // Reload. TODO just update the field
            .catch(err => dispatch(errorPolicy(err, id)));
    }
}

export function updatePolicyResource(id, resource) {
    return dispatch => {
        console.log('updatePolicyResource', id, resource);
        if (!id) {
            return dispatch(updateNewPolicyResource(resource));
        }

        dispatch(requestPolicy(id)); // loading = true

        doFetchWithAuth(API_POLICY_RES_URL.replace("{0}", id), {
            method: 'PUT',
            body: JSON.stringify(description),
        })
            .then(() => dispatch(fetchPolicy(id))) // Reload. TODO just update the field
            .catch(err => dispatch(errorPolicy(err, id)));
    }
}


function updateNewPolicyUsers(users) {
    console.log('updateNewPolicyUsers');
    return {
        type: POLICY_UPDATE_USERS_REQUEST,
        data: users,
    };
}

export function updatePolicyUsers(id, users) {
    return dispatch => {
        console.log('updatePolicyUsers', id, users);
        if (!id) {
            return dispatch(updateNewPolicyUsers(users));
        }

        dispatch(requestPolicy(id)); // loading = true

        doFetchWithAuth(API_POLICY_USERS_URL.replace("{0}", id), {
            method: 'PUT',
            body: JSON.stringify(users),
        })
            .then(() => dispatch(fetchPolicy(id))) // Reload. TODO just update the field
            .catch(err => dispatch(errorPolicy(err, id)));
    }
}

function updateNewPolicyPermissions(permissions) {
    console.log('updateNewPolicyPermissions');
    return {
        type: POLICY_UPDATE_ROLES_REQUEST,
        data: permissions,
    };
}

export function updatePolicyPermissions(id, permissions) {
    return dispatch => {
        console.log('updatePolicyPermissions', id, permissions);
        if (!id) {
            return dispatch(updateNewPolicyPermissions(permissions));
        }

        dispatch(requestPolicy(id)); // loading = true

        doFetchWithAuth(API_POLICY_ROLES_URL.replace("{0}", id), {
            method: 'PUT',
            body: JSON.stringify(permissions),
        })
            .then(() => dispatch(fetchPolicy(id))) // Reload. TODO just update the field
            .catch(err => dispatch(errorPolicy(err, id)));
    }
}

export function deletePolicy(id) {
    return dispatch => {
        console.log('deletePolicy');
        doFetchWithAuth(API_POLICY_URL.replace("{0}", id), {
            method: 'DELETE',
        })
            .then(() => dispatch(fetchPolicies()))
            .catch(err => dispatch(errorPolicy(err, id)));
    }
}

export function saveNewPolicy(policy) {
    return dispatch => {
        console.log('saveNewPolicy', policy);

        doFetchWithAuth(API_POLICIES_URL, {
            method: 'POST',
            body: JSON.stringify(policy),
        })
            .then(id => dispatch(receivePolicy({...policy, id}, id)))
            .catch(err => dispatch(errorPolicy(err, null)));
    }
}
