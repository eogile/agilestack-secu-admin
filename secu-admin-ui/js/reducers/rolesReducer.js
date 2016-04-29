import { ROLES_LOAD_REQUEST, ROLES_LOAD_SUCCESS, ROLES_LOAD_ERROR } from '../constants/AppConstants';

const initialState = {
    loading: false,
    loaded: false,
    data: [],
};

export default function rolesReducer(state = initialState, action = null) {
    Object.freeze(state);
    switch (action.type) {
        case ROLES_LOAD_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case ROLES_LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                data: action.data,
            };
        case ROLES_LOAD_ERROR:
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
