// Gets called when running npm start

var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.dev.config');

console.log('Starting server...\n');

new WebpackDevServer(webpack(config), { // Start a server
  publicPath: config.output.publicPath,
  hot: true, // With hot reloading
  inline: false,
  historyApiFallback: true,
  quiet: true, // Without logging
  proxy: { //proxy is there for npm run start:apiprod
    '/api': {
      target: 'http://localhost:8080',
      secure: false,
      changeOrigin: true,
    },
    '/login': {
      target: 'http://localhost:8080',
      secure: false,
      changeOrigin: true,
    },
  }
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log('Server started');
    console.log('Listening at localhost:3000');
  }
});
