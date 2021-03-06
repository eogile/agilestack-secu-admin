import { USERS_LOAD_REQUEST, USERS_LOAD_SUCCESS, USERS_LOAD_ERROR } from '../constants/AppConstants';

const initialState = {
    loading: false,
    loaded: false,
    data: [],
};

export default function usersReducer(state = initialState, action = null) {
    Object.freeze(state);
    switch (action.type) {
        case USERS_LOAD_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case USERS_LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                data: action.data,
            };
        case USERS_LOAD_ERROR:
            return {
                ...state,
                loading: false,
                loaded: false,
                error: action.data,
            };
        default:
            return state;
    }
}
