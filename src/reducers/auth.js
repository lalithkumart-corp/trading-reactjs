let defaultState = {
    isAuthenticated: true,
};
export default function authReducer(state=defaultState, action){
    let newState = { ...state };
    switch(action.type){
        case 'AUTH_SUCCESS':
            newState = {
                ...newState,
                isAuthenticated: true
            };
            break;
    }
    return newState;
}
