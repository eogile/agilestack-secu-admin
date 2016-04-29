import fetch from 'isomorphic-fetch';

import { RESOURCES_LOAD_REQUEST, RESOURCES_LOAD_SUCCESS, RESOURCES_LOAD_ERROR, API_RESOURCES_URL } from '../constants/AppConstants';
import { doFetchWithAuth } from './authActionsUtils';

function requestResources() {
    console.log('requestResources');
    return {
        type: RESOURCES_LOAD_REQUEST,
    };
}

function receiveResources(json) {
    console.log('receiveResources');
    return {
        type: RESOURCES_LOAD_SUCCESS,
        data: json,
    };
}

function errorResources(error) {
    console.log('errorResources');
    return {
        type: RESOURCES_LOAD_ERROR,
        data: error,
    }
}

function fetchResources() {
    return dispatch => {
        console.log('fetchResources on : ', API_RESOURCES_URL);
        dispatch(requestResources());

        doFetchWithAuth(API_RESOURCES_URL)
            .then(json => dispatch(receiveResources(json)))
            .catch(err => dispatch(errorResources(err)));
    };
}

function isResourcesLoaded(globalState) {
    console.log('isResourcesLoaded');
    return globalState.resources && globalState.resources.loaded;
}

export function fetchResourcesIfNeeded() {
    return (dispatch, getState) => {
        console.log('fetchResourcesIfNeeded');
        if (isResourcesLoaded(getState())) {
            return;
        }
        return dispatch(fetchResources());
    }
}
