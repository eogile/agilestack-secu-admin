import { RESOURCES_LOAD_REQUEST, RESOURCES_LOAD_SUCCESS, RESOURCES_LOAD_ERROR } from '../constants/AppConstants';

const initialState = {
    loading: false,
    loaded: false,
    data: [],
};

// // Convert permissions Of resources, so permisions become object {label:"", value:""}
// // return the new resources
// function convertPermissionsOfResources(resources) {
//   var resources
// }

export default function resourcesReducer(state = initialState, action = null) {
    Object.freeze(state);
    switch (action.type) {
        case RESOURCES_LOAD_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case RESOURCES_LOAD_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                data: action.data,
            };
        case RESOURCES_LOAD_ERROR:
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
