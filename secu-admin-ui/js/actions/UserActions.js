import fetch from 'isomorphic-fetch';

import {
    USERS_LOAD_REQUEST,
    USERS_LOAD_SUCCESS,
    USERS_LOAD_ERROR,
    USER_LOAD_REQUEST,
    USER_LOAD_SUCCESS,
    USER_CREATE_REQUEST,
    USER_ERROR,
    USER_CLEAR_ERROR,
    API_USERS_URL,
    API_USER_URL,
    API_USER_NAME_URL,
} from '../constants/AppConstants';

import { doFetchWithAuth } from './authActionsUtils';

function requestUsers() {
    console.log('requestUsers');
    return {
        type: USERS_LOAD_REQUEST,
    };
}

function receiveUsers(json) {
    console.log('receiveUsers');
    return {
        type: USERS_LOAD_SUCCESS,
        data: json,
    };
}

function errorUsers(error) {
    console.log('errorUsers');
    return {
        type: USERS_LOAD_ERROR,
        data: error,
    }
}

export function fetchUsers() {
    return dispatch => {
        dispatch(requestUsers());
        console.log('in fetchUsers before doFetchWithAuth');
        doFetchWithAuth(API_USERS_URL)
            .then(json => dispatch(receiveUsers(json)))
            .catch(err => dispatch(errorUsers(err)));
    };
}

function isUsersLoaded(globalState) {
    console.log('isUsersLoaded');
    return globalState.users && globalState.users.loaded;
}

export function fetchUsersIfNeeded(tokenInfo) {
    return (dispatch, getState) => {
        console.log('fetchUsersIfNeeded');
        if (isUsersLoaded(getState())) {
            return;
        }
        return dispatch(fetchUsers(tokenInfo));
    }
}



function requestUser(id) {
    console.log('requestUser', id);
    return {
        type: USER_LOAD_REQUEST,
        id,
    };
}

function receiveUser(json, id) {
    console.log('receiveUser');
    return {
        type: USER_LOAD_SUCCESS,
        data: json,
        id,
    };
}

function errorUser(error, id) {
    console.log('errorUser', error);
    return {
        type: USER_ERROR,
        data: error,
        id,
    }
}

export function clearUserError(id) {
    console.log('clearUserError');
    return {
        type: USER_CLEAR_ERROR,
        id,
    }
}

function createUser() {
    console.log('createUser');
    return {
        type: USER_CREATE_REQUEST,
    }
}

function fetchUser(id) {
    return dispatch => {
        console.log('fetchUser');
        dispatch(requestUser(id));

        doFetchWithAuth(API_USER_URL.replace("{0}", id))
            .then(json => dispatch(receiveUser(json, id)))
            .catch(err => dispatch(errorUser(err, id)));
    };
}

function isUserLoaded(globalState, id) {
    console.log('isUserLoaded');
    return globalState.user && globalState.user.loaded && globalState.user.id == id;
}

export function fetchUserIfNeeded(id) {
    return (dispatch, getState) => {
        console.log('fetchUserIfNeeded');
        if (!id) {
            return dispatch(createUser());
        } else if (isUserLoaded(getState(), id)) {
            return;
        }
        return dispatch(fetchUser(id));
    }
}

export function updateUserName(id, firstName, lastName) {
    return dispatch => {
        console.log('updateUserName', id, firstName, lastName);
        if (!id) {
            // Unsaved users are handled in the component state
            return;
        }

        dispatch(requestUser(id)); // loading = true

        doFetchWithAuth(API_USER_NAME_URL.replace("{0}", id), {
            method: 'PUT',
            body: JSON.stringify({firstName, lastName}),
        })
            .then(() => dispatch(fetchUser(id))) // Reload. TODO just update the field
            .catch(err => dispatch(errorUser(err, id)));
    }
}

export function deleteUser(id) {
    return dispatch => {
        console.log('deleteUser');
        doFetchWithAuth(API_USER_URL.replace("{0}", id), {
            method: 'DELETE',
        })
            .then(() => dispatch(fetchUsers()))
            .catch(err => dispatch(errorUser(err, id)));
    }
}

export function saveNewUser(user) {
    return dispatch => {
        console.log('saveNewUser', user);

        doFetchWithAuth(API_USERS_URL, {
            method: 'POST',
            body: JSON.stringify(user),
        })
            .then(id => dispatch(receiveUser({...user, id}, id)))
            .catch(err => dispatch(errorUser(err, null)));
    }
}
