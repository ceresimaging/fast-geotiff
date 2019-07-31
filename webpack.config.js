const path = require('path')

module.exports = {
  entry: './geotiff/index.js',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules|dist)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env'],
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      // Necessary for GeoTIFF.js :-/
      'babel-runtime': '@babel/runtime',
    }
  }
}