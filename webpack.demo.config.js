const path = require('path');

const demoEntryPoint = 'demo/demo2.ts'

module.exports = {
  watch: true,
  entry: [
    './src/index.ts',
    './src/' + demoEntryPoint,
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
