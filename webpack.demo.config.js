const path = require('path');

module.exports = {
  watch: true,
  entry: {
    demo: './demo/demo.ts',
    demo2: './demo/demo2.ts',
    demo3: './demo/demo3.ts',
    demo4: './demo/demo4.ts',
    imageDemo: './demo/imageDemo.ts',
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
