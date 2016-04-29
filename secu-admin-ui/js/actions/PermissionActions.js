import fetch from 'isomorphic-fetch';

import { PERMISSIONS_LOAD_REQUEST, PERMISSIONS_LOAD_SUCCESS, PERMISSIONS_LOAD_ERROR, API_PERMISSIONS_URL } from '../constants/AppConstants';

function requestPermissions() {
    console.log('requestPermissions');
    return {
        type: PERMISSIONS_LOAD_REQUEST,
    };
}

function receivePermissions(json) {
    console.log('receivePermissions');
    return {
        type: PERMISSIONS_LOAD_SUCCESS,
        data: json,
    };
}

function errorPermissions(error) {
    console.log('errorPermissions');
    return {
        type: PERMISSIONS_LOAD_ERROR,
        data: error,
    }
}

function fetchPermissions() {
    return dispatch => {
        console.log('fetchPermissions');
        dispatch(requestPermissions());

        fetch(API_PERMISSIONS_URL)
            .then(response => response.json())
            .then(json => dispatch(receivePermissions(json)))
            .catch(err => dispatch(errorPermissions(err)));
    };
}

function isPermissionsLoaded(globalState) {
    console.log('isPermissionsLoaded');
    return globalState.permissions && globalState.permissions.loaded;
}

export function fetchPermissionsIfNeeded() {
    return (dispatch, getState) => {
        console.log('fetchPermissionsIfNeeded');
        if (isPermissionsLoaded(getState())) {
            return;
        }
        return dispatch(fetchPermissions());
    }
}
