/**
 * Combine all reducers in this file and export the combined reducers.
 * If we were to do this in store.js, reducers wouldn't be hot reloadable.
 */

import { combineReducers } from 'redux';

import rolesReducer from './rolesReducer';
import permissionsReducer from './permissionsReducer';
import resourcesReducer from './resourcesReducer';
import usersReducer from './usersReducer';
import userReducer from './userReducer';
import profilesReducer from './profilesReducer';
import profileReducer from './profileReducer';
import policiesReducer from './policiesReducer';
import policyReducer from './policyReducer';
import loginReducer from 'agilestack-login-ui/lib/reducers/loginReducer';
import {routerReducer} from 'react-router-redux'

const rootReducer = combineReducers({
    roles: rolesReducer,
    permissions: permissionsReducer,
    resources: resourcesReducer,
    users: usersReducer,
    user: userReducer,
    profiles: profilesReducer,
    profile: profileReducer,
    policies: policiesReducer,
    policy: policyReducer,
    login: loginReducer,
    routing: routerReducer,
});

export default rootReducer;
