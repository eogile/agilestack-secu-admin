import { PERMISSIONS_LOAD_REQUEST, PERMISSIONS_LOAD_SUCCESS, PERMISSIONS_LOAD_ERROR } from '../constants/AppConstants';

const initialState = {
    loading: false,
    loaded: false,
    data: [],
};

export default function permissionsReducer(state = initialState, action = null) {
    Object.freeze(state);
    switch (action.type) {
        case PERMISSIONS_LOAD_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case PERMISSIONS_LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                data: action.data,
            };
        case PERMISSIONS_LOAD_ERROR:
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
