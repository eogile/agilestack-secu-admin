import fetch from 'isomorphic-fetch';

import { ROLES_LOAD_REQUEST, ROLES_LOAD_SUCCESS, ROLES_LOAD_ERROR, API_ROLES_URL } from '../constants/AppConstants';

function requestRoles() {
    console.log('requestRoles');
    return {
        type: ROLES_LOAD_REQUEST,
    };
}

function receiveRoles(json) {
    console.log('receiveRoles');
    return {
        type: ROLES_LOAD_SUCCESS,
        data: json,
    };
}

function errorRoles(error) {
    console.log('errorRoles');
    return {
        type: ROLES_LOAD_ERROR,
        data: error,
    }
}

function fetchRoles() {
    return dispatch => {
        console.log('fetchRoles');
        dispatch(requestRoles());

        fetch(API_ROLES_URL)
            .then(response => response.json())
            .then(json => dispatch(receiveRoles(json)))
            .catch(err => dispatch(errorRoles(err)));
    };
}

function isRolesLoaded(globalState) {
    console.log('isRolesLoaded');
    return globalState.roles && globalState.roles.loaded;
}

export function fetchRolesIfNeeded() {
    return (dispatch, getState) => {
        console.log('fetchRolesIfNeeded');
        if (isRolesLoaded(getState())) {
            return;
        }
        return dispatch(fetchRoles());
    }
}
