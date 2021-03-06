const path = require('path');

module.exports = {
  watch: true,
  entry: [
    './src/index.ts',
    './src//demo/demo.ts',
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'demo-bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
