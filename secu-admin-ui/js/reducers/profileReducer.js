import {
    PROFILE_LOAD_REQUEST,
    PROFILE_LOAD_SUCCESS,
    PROFILE_CREATE_REQUEST,
    PROFILE_UPDATE_DESC_REQUEST,
    PROFILE_UPDATE_USERS_REQUEST,
    PROFILE_UPDATE_ROLES_REQUEST,
    PROFILE_ERROR,
    PROFILE_CLEAR_ERROR,
} from '../constants/AppConstants';

const initialState = {
    loading: false,
    loaded: false,
    id: null,
    data: null,
};

export default function profileReducer(state = initialState, action = null) {
    //console.log('profileReducer', action);
    Object.freeze(state);
    const { data } = state;
    switch (action.type) {
        case PROFILE_LOAD_REQUEST:
            return {
                ...state,
                id: action.id,
                loading: true,
            };
        case PROFILE_LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                id: action.id,
                data: action.data,
                error: null,
            };
        case PROFILE_ERROR:
            return {
                ...state,
                loading: false,
                id: action.id,
                error: action.data,
            };
        case PROFILE_CLEAR_ERROR:
            return {
                ...state,
                id: action.id,
                error: null,
            };
        case PROFILE_CREATE_REQUEST:
            return {
                ...state,
                loading: false,
                loaded: true,
                id: null,
                data: {
                    description: null,
                    users: [],
                    roles: [],
                },
                error: null,
            };
        case PROFILE_UPDATE_DESC_REQUEST:
            return {
                ...state,
                data: {
                    ...data,
                    description: action.data,
                },
            };
        case PROFILE_UPDATE_USERS_REQUEST:
            return {
                ...state,
                data: {
                    ...data,
                    users: action.data,
                },
            };
        case PROFILE_UPDATE_ROLES_REQUEST:
            return {
                ...state,
                data: {
                    ...data,
                    roles: action.data,
                },
            };
        default:
            return state;
    }
}
