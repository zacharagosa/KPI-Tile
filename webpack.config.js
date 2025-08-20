const path = require('path');

module.exports = {
  entry: './src/kpi_tile.js',
  output: {
    filename: 'kpi_tile.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    open: 'kpi_tile.html',
    https: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Target JavaScript files
      exclude: /node_modules\/(?!(@react-spring)\/).*/, // Exclude most of node_modules, but INCLUDE @react-spring
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react']
        }
      }
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  }
};

