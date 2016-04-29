import {
    USER_LOAD_REQUEST,
    USER_LOAD_SUCCESS,
    USER_CREATE_REQUEST,
    USER_ERROR,
    USER_CLEAR_ERROR,
} from '../constants/AppConstants';

const initialState = {
    loading: false,
    loaded: false,
    id: null,
    data: null,
    error: null,
};

export default function userReducer(state = initialState, action = null) {
    //console.log('userReducer', action);
    Object.freeze(state);
    switch (action.type) {
        case USER_LOAD_REQUEST:
            return {
                ...state,
                id: action.id,
                loading: true,
            };
        case USER_LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                id: action.id,
                data: action.data,
                error: null,
            };
        case USER_ERROR:
            return {
                ...state,
                loading: false,
                id: action.id,
                error: action.data,
            };
        case USER_CLEAR_ERROR:
            return {
                ...state,
                id: action.id,
                error: null,
            };
        case USER_CREATE_REQUEST:
            return {
                ...state,
                loading: false,
                loaded: true,
                id: null,
                data: {
                    login: null,
                    password: null,
                    firstName: null,
                    lastName: null,
                },
                error: null,
            };
        default:
            return state;
    }
}
