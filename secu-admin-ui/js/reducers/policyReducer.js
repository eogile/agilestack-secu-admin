import {
    POLICY_LOAD_REQUEST,
    POLICY_LOAD_SUCCESS,
    POLICY_CREATE_REQUEST,
    POLICY_UPDATE_DESC_REQUEST,
    POLICY_UPDATE_RES_REQUEST,
    POLICY_UPDATE_USERS_REQUEST,
    POLICY_UPDATE_ROLES_REQUEST,
    POLICY_ERROR,
    POLICY_CLEAR_ERROR,
} from '../constants/AppConstants';

const initialState = {
    loading: false,
    loaded: false,
    id: null,
    data: null,
};

export default function policyReducer(state = initialState, action = null) {
    //console.log('profileReducer', action);
    Object.freeze(state);
    const { data } = state;
    switch (action.type) {
        case POLICY_LOAD_REQUEST:
            return {
                ...state,
                id: action.id,
                loading: true,
            };
        case POLICY_LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                id: action.id,
                data: action.data,
                error: null,
            };
        case POLICY_ERROR:
            return {
                ...state,
                loading: false,
                id: action.id,
                error: action.data,
            };
        case POLICY_CLEAR_ERROR:
            return {
                ...state,
                id: action.id,
                error: null,
            };
        case POLICY_CREATE_REQUEST:
            return {
                ...state,
                loading: false,
                loaded: true,
                id: null,
                data: {
                    description: null,
                    users: [],
                    permissions: [],
                },
                error: null,
            };
        case POLICY_UPDATE_DESC_REQUEST:
            return {
                ...state,
                data: {
                    ...data,
                    description: action.data,
                },
            };
        case POLICY_UPDATE_RES_REQUEST:
            return {
                ...state,
                data: {
                    ...data,
                    resource: action.data,
                },
            };
        case POLICY_UPDATE_USERS_REQUEST:
            return {
                ...state,
                data: {
                    ...data,
                    users: action.data,
                },
            };
        case POLICY_UPDATE_ROLES_REQUEST:
            return {
                ...state,
                data: {
                    ...data,
                    permissions: action.data,
                },
            };
        default:
            return state;
    }
}
