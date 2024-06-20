const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.ts', // Entry point of your application
  output: {
    filename: 'bundle.js', // Output bundle file name
    path: path.resolve(__dirname, 'dist'), // Output directory
    clean: true, // Clean the output directory before emitting
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolve these extensions
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Transpile TypeScript files
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/, // Load CSS files
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html', // Source HTML file
      filename: 'index.html' // Output HTML file in 'dist' directory
    })
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
    hot: true,
    watchFiles: ['src/**/*.html'] // Watch HTML files for changes
  },
  mode: 'development', // Set the mode to development
};
