import express from 'express';
import path from 'path';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {StaticRouter, matchPath} from 'react-router-dom';
import {Provider} from 'react-redux';
// import Helmet from 'react-helmet';
import routes from './routes';
import store from './store/store';
// import http from './utils/http.js';
import config from './config';
import App from './containers/app-server';

// http.init(store);

const app = express();

app.use(express.static(path.resolve(__dirname, '../dist')));

app.get('/*', (req, res) => {
  const context = {};
  const dataRequirements =
    routes
      .filter(route => matchPath(req.url, route)) // filter matching paths
      .map(route => route.component) // map to components
      .filter(comp => comp.serverFetch) // check if components have data requirement
      .map(comp => store.dispatch(comp.serverFetch())); // dispatch data requirement

  Promise.all(dataRequirements).then(() => {
    const jsx = (
      <Provider store={store}>
        <StaticRouter context={context} location={req.url}>
          <App/>
        </StaticRouter>
      </Provider>
    );
    const reactDom = renderToString(jsx);
    const reduxState = store.getState();
    // const helmetData = Helmet.renderStatic();

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(htmlTemplate(reactDom, reduxState));
  });
});

app.listen(config.server.port);
console.log(`Server run on http://${config.server.host}:${config.server.port}`);

function htmlTemplate(reactDom, reduxState) {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <base href="/">
            <meta charset="utf-8">
            <title>App SSR</title>
        </head>
        
        <body>
            <div id="app">${reactDom}</div>
            <script>
                window.REDUX_DATA = ${JSON.stringify(reduxState)}
            </script>
            <script type="text/javascript" src="main.js"></script>
        </body>
        </html>
    `;
}