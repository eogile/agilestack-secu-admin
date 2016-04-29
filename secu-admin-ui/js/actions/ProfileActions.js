import fetch from 'isomorphic-fetch';

import {
    PROFILES_LOAD_REQUEST,
    PROFILES_LOAD_SUCCESS,
    PROFILES_LOAD_ERROR,
    PROFILE_LOAD_REQUEST,
    PROFILE_LOAD_SUCCESS,
    PROFILE_CREATE_REQUEST,
    PROFILE_UPDATE_DESC_REQUEST,
    PROFILE_UPDATE_USERS_REQUEST,
    PROFILE_UPDATE_ROLES_REQUEST,
    PROFILE_ERROR,
    PROFILE_CLEAR_ERROR,
    API_PROFILES_URL,
    API_PROFILE_URL,
    API_PROFILE_DESC_URL,
    API_PROFILE_USERS_URL,
    API_PROFILE_ROLES_URL,
} from '../constants/AppConstants';

import { doFetchWithAuth } from './authActionsUtils';

function requestProfiles() {
    console.log('requestProfiles');
    return {
        type: PROFILES_LOAD_REQUEST,
    };
}

function receiveProfiles(json) {
    console.log('receiveProfiles');
    return {
        type: PROFILES_LOAD_SUCCESS,
        data: json,
    };
}

function errorProfiles(error) {
    console.log('errorProfiles');
    return {
        type: PROFILES_LOAD_ERROR,
        data: error,
    }
}

export function fetchProfiles() {
    return dispatch => {
        console.log('fetchProfiles');
        dispatch(requestProfiles());

        doFetchWithAuth(API_PROFILES_URL)
            .then(json => dispatch(receiveProfiles(json)))
            .catch(err => dispatch(errorProfiles(err)));
    };
}

function isProfilesLoaded(globalState) {
    console.log('isProfilesLoaded');
    return globalState.profiles && globalState.profiles.loaded;
}

export function fetchProfilesIfNeeded() {
    return (dispatch, getState) => {
        console.log('fetchProfilesIfNeeded');
        if (isProfilesLoaded(getState())) {
            return;
        }
        return dispatch(fetchProfiles());
    }
}



function requestProfile(id) {
    console.log('requestProfile', id);
    return {
        type: PROFILE_LOAD_REQUEST,
        id,
    };
}

function receiveProfile(json, id) {
    console.log('receiveProfile');
    return {
        type: PROFILE_LOAD_SUCCESS,
        data: json,
        id,
    };
}

function errorProfile(error, id) {
    console.log('errorProfile', error);
    return {
        type: PROFILE_ERROR,
        data: error,
        id,
    }
}

export function clearProfileError(id) {
    console.log('clearProfileError');
    return {
        type: PROFILE_CLEAR_ERROR,
        id,
    }
}

function createProfile() {
    console.log('createProfile');
    return {
        type: PROFILE_CREATE_REQUEST,
    }
}

function fetchProfile(id) {
    return dispatch => {
        console.log('fetchProfile');
        dispatch(requestProfile(id));

        doFetchWithAuth(API_PROFILE_URL.replace("{0}", id))
            .then(json => dispatch(receiveProfile(json, id)))
            .catch(err => dispatch(errorProfile(err, id)));
    };
}

function isProfileLoaded(globalState, id) {
    console.log('isProfileLoaded');
    return globalState.profile && globalState.profile.loaded && globalState.profile.id == id;
}

export function fetchProfileIfNeeded(id) {
    return (dispatch, getState) => {
        console.log('fetchProfileIfNeeded');
        if (!id) {
            return dispatch(createProfile());
        } else if (isProfileLoaded(getState(), id)) {
            return;
        }
        return dispatch(fetchProfile(id));
    }
}

function updateNewProfileDescription(description) {
    console.log('updateNewProfileDescription');
    return {
        type: PROFILE_UPDATE_DESC_REQUEST,
        data: description,
    };
}

export function updateProfileDescription(id, description) {
    return dispatch => {
        console.log('updateProfileDescription', id, description);
        if (!id) {
            return dispatch(updateNewProfileDescription(description));
        }

        dispatch(requestProfile(id)); // loading = true

        doFetchWithAuth(API_PROFILE_DESC_URL.replace("{0}", id), {
            method: 'PUT',
            body: JSON.stringify(description),
        })
            .then(() => dispatch(fetchProfile(id))) // Reload. TODO just update the field
            .catch(err => dispatch(errorProfile(err, id)));
    }
}

function updateNewProfileUsers(users) {
    console.log('updateNewProfileUsers');
    return {
        type: PROFILE_UPDATE_USERS_REQUEST,
        data: users,
    };
}

export function updateProfileUsers(id, users) {
    return dispatch => {
        console.log('updateProfileUsers', id, users);
        if (!id) {
            return dispatch(updateNewProfileUsers(users));
        }

        dispatch(requestProfile(id)); // loading = true

        doFetchWithAuth(API_PROFILE_USERS_URL.replace("{0}", id), {
            method: 'PUT',
            body: JSON.stringify(users),
        })
            .then(() => dispatch(fetchProfile(id))) // Reload. TODO just update the field
            .catch(err => dispatch(errorProfile(err, id)));
    }
}

function updateNewProfileRoles(roles) {
    console.log('updateNewProfileRoles');
    return {
        type: PROFILE_UPDATE_ROLES_REQUEST,
        data: roles,
    };
}

export function updateProfileRoles(id, roles) {
    return dispatch => {
        console.log('updateProfileRoles', id, roles);
        if (!id) {
            return dispatch(updateNewProfileRoles(roles));
        }

        dispatch(requestProfile(id)); // loading = true

        doFetchWithAuth(API_PROFILE_ROLES_URL.replace("{0}", id), {
            method: 'PUT',
            body: JSON.stringify(roles),
        })
            .then(() => dispatch(fetchProfile(id))) // Reload. TODO just update the field
            .catch(err => dispatch(errorProfile(err, id)));
    }
}

export function deleteProfile(id) {
    return dispatch => {
        console.log('deleteProfile');
        doFetchWithAuth(API_PROFILE_URL.replace("{0}", id), {
            method: 'DELETE',
        })
            .then(() => dispatch(fetchProfiles()))
            .catch(err => dispatch(errorProfile(err, id)));
    }
}

export function saveNewProfile(profile) {
    return dispatch => {
        console.log('saveNewProfile', profile);

        doFetchWithAuth(API_PROFILES_URL, {
            method: 'POST',
            body: JSON.stringify(profile),
        })
            .then(id => dispatch(receiveProfile({...profile, id}, id)))
            .catch(err => dispatch(errorProfile(err, null)));
    }
}
