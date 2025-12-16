const path = require('path');

module.exports = {
  entry: {
    kpi_tile: './src/kpi_tile.js',
    dynamic_measure_bar_chart: './src/dynamic_measure_bar_chart.js',
    image_heatmap: './src/image_heatmap.js',
    image_heatmap_lib: './src/image_heatmap_lib.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    open: 'kpi_tile.html',
    port: 8080,
    server: 'http',
    allowedHosts: 'all',
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      "Access-Control-Allow-Private-Network": "true"
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

