var package = require('./package.json');
module.exports = {
  context: __dirname + package.paths.app.all,
  entry: "./" + package.paths.app.main,
  output: {
    path: __dirname + package.paths.public.js.all,
    filename: package.paths.public.js.main,
    publicPath: "localhost:9001"
  },
  module: {
    loaders: [
      {
        test: /\.js[x]*$/,
        loaders: ["jsx-loader?harmony"],
      },
      {
        test: /\.scss$/,
        loader: 'style!css!sass'
      }]
    },
    devtool: "#source-map"

  }
  var options = {
    port: 9001,
    host: 'localhost',
    server: {
      baseDir: './public'
    },
    ui: {
      port: 9002
    },
  }
  var browserSync = require('browser-sync');
  browserSync(['public/**/*.*'],options);
