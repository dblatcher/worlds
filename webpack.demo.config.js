const path = require('path');

module.exports = {
  watch: true,
  entry: {
    demo: './src/demo/demo.ts',
    demo2: './src/demo/demo2.ts',
    splash: './src/demo/splash.ts',
  },
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
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
