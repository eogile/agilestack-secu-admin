import { PROFILES_LOAD_REQUEST, PROFILES_LOAD_SUCCESS, PROFILES_LOAD_ERROR } from '../constants/AppConstants';

const initialState = {
    loading: false,
    loaded: false,
    data: [],
};

export default function profilesReducer(state = initialState, action = null) {
    Object.freeze(state);
    switch (action.type) {
        case PROFILES_LOAD_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case PROFILES_LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                data: action.data,
            };
        case PROFILES_LOAD_ERROR:
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
