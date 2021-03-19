import { applyMiddleware, createStore, combineReducers, compose } from 'redux';
import reduxThunk from 'redux-thunk';
import logger from 'redux-logger';
import authReducer from './reducers/auth.js';
export const getStore = () => {

    const theReducers = combineReducers({
        auth: authReducer
    });

    const middleware = applyMiddleware(reduxThunk, logger);

    let store = createStore(theReducers, compose(middleware)); //, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
        
    return store;
}
