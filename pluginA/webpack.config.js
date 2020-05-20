var path = require('path');

module.exports = {
  entry: {
    app: [path.resolve(__dirname, './src/main.tsx')]
  },
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'bundle.js',
    publicPath: "/build/",
  },
  devServer: {
    contentBase: path.resolve(__dirname),
    compress: true,
    port: 9000
  },
  module: {
    rules: [{
      test: /\.js[x]?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/env', '@babel/react']
        }
      }
    }, {
      test: /\.ts[x]?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/env', '@babel/react']
        }
      }, {
        loader: 'ts-loader',
        options: {
          configFile: path.resolve(__dirname, './tsconfig.json')
        }
      }]
    }]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
};
