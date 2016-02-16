var webpack = require('webpack');
var path    = require('path');

module.exports = {
  entry     : [
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/dev-server',
    "./src/"
  ],
  output    : {
    path: __dirname + '/public',
    filename: 'bundle.js',
    publicPath: '/public'
  },
  module    : {
    loaders : [
      {
        test    : /\.js$/,
        exclude : /node_modules/,
        loaders : ['react-hot','babel-loader']
      },
      { test: /\.css$/, loader: 'style!css'}
    ]
  },
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react')
    },
    fallback: path.resolve(__dirname, './node_modules')
  },
  resolveLoader: {
    fallback: path.resolve(__dirname, './node_modules')
  },
  node: {
    fs: "empty",
    tls: "empty"
  },
  devServer : { hot: true },
  plugins   : [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
    'process.env.NODE_ENV': '"development"'
    })
  ],
  inline    : true,
  progress  : true,
  colors    : true
};
