const path = require('path');

const config = {
  target: 'webworker',
  entry: './tests/index.js',
  devtool: false,
  mode: 'production',
  output: {
    path: path.resolve(__dirname, './tests/dist'),
    filename: 'worker.js',
  },
};

module.exports = config;
