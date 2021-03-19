
export const doLogin = (params) => {
    return (dispatch) => {
        //TODO: business logic
        dispatch({
            type: 'AUTH_SUCCESS',
            data: {}
        });
    }
}