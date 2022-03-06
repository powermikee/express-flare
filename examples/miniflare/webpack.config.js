const path = require('path');

const config = {
  target: 'webworker',
  entry: './src/index.js',
  devtool: 'cheap-module-source-map',
  mode: 'development',
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    path: path.resolve(__dirname, './dist'),
    filename: 'worker.js',
  },
};

module.exports = config;
