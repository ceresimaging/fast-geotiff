const path = require('path')

module.exports = {
  entry: './geotiff/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: "umd",
    umdNamedDefine: true,
    library: 'fast-geotiff'
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
  externals: [
    /^geotiff\//i,
  ],

}