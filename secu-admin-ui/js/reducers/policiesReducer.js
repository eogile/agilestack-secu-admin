import { POLICIES_LOAD_REQUEST, POLICIES_LOAD_SUCCESS, POLICIES_LOAD_ERROR } from '../constants/AppConstants';

const initialState = {
    loading: false,
    loaded: false,
    data: [],
};

export default function policiesReducer(state = initialState, action = null) {
    Object.freeze(state);
    switch (action.type) {
        case POLICIES_LOAD_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case POLICIES_LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                data: action.data,
            };
        case POLICIES_LOAD_ERROR:
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
