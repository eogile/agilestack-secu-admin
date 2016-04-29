/**
 *
 * app.js
 *
 * This is the entry file for the application, mostly just setup and boilerplate
 * code. Routes are configured at the end of this file!
 *
 */

// Load the ServiceWorker, the Cache polyfill, the manifest.json file and the .htaccess file
import 'file?name=[name].[ext]!../serviceworker.js';
import 'file?name=[name].[ext]!../manifest.json';
import 'file?name=[name].[ext]!../.htaccess';

//// Check for ServiceWorker support before trying to install it
//if ('serviceWorker' in navigator) {
//  navigator.serviceWorker.register('/serviceworker.js').then(() => {
//    console.log("service worker registered");// Registration was successful
//  }).catch((err) => {
//    // Registration failed
//    console.log("service worker registration failed.", err);
//  });
//} else {
//  // No ServiceWorker Support
//}

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, hashhistory, IndexRoute } from 'react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import FontFaceObserver from 'fontfaceobserver';
//import createHistory from 'history/lib/createBrowserHistory';
import { createHistory, useBasename } from 'history';
import { routerMiddleware, syncHistoryWithStore } from 'react-router-redux';

// Observer loading of Open Sans (to remove open sans, remove the <link> tag in the index.html file and this observer)
const openSansObserver = new FontFaceObserver('Open Sans', {});

// When Open Sans is loaded, add the js-open-sans-loaded class to the body
openSansObserver.check().then(() => {
  document.body.classList.add('js-open-sans-loaded');
}, () => {
  document.body.classList.remove('js-open-sans-loaded');
});

// Needed for onTouchTap
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// Import the pages
import HomePage from './components/pages/HomePage.react';
import { LoginPage } from 'agilestack-login-ui/lib';
import ProfilesPage from './components/pages/ProfilesPage.react';
import UsersPage from './components/pages/UsersPage.react';
import RolesPage from './components/pages/RolesPage.react';
import ReadmePage from './components/pages/ReadmePage.react';
import NotFoundPage from './components/pages/NotFound.react';
import App from './components/App.react';

// Import the CSS file, which HtmlWebpackPlugin transfers to the build folder
import '../css/main.css';

let history = useBasename(createHistory)({
  basename: window.baseUrl
});
// Create the store with the redux-thunk middleware, which allows us
// to do asynchronous things in the actions
import rootReducer from './reducers/rootReducer';
const middlewareHistory = routerMiddleware(history);
const createStoreWithMiddleware = compose(
    applyMiddleware(thunk),
    applyMiddleware(middlewareHistory),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )(createStore);
const store = createStoreWithMiddleware(rootReducer);

history = syncHistoryWithStore(history, store);

// Make reducers hot reloadable, see http://stackoverflow.com/questions/34243684/make-redux-reducers-and-other-non-components-hot-loadable
if (module.hot) {
  module.hot.accept('./reducers/rootReducer', () => {
    const nextRootReducer = require('./reducers/rootReducer').default;
    store.replaceReducer(nextRootReducer);
  });
}

// Mostly boilerplate, except for the Routes. These are the pages you can go to,
// which are all wrapped in the App component, which contains the navigation etc
ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={HomePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/profiles" component={ProfilesPage} />
        <Route path="/users" component={UsersPage} />
        <Route path="/roles" component={RolesPage} />
        <Route path="/readme" component={ReadmePage} />
        <Route path="*" component={NotFoundPage} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);
