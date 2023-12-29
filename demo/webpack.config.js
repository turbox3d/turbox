const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const plugins = [];
if (process.env.NODE_ENV !== 'production') {
  plugins.push(new BundleAnalyzerPlugin());
}

module.exports = {
  entry: {
    app: [path.resolve(__dirname, './src/index.tsx')]
  },
  mode: 'development',
  output: {
    path: path.resolve(process.cwd(), process.env.BUILD_DEST || './build'),
    filename: 'bundle.js',
    publicPath: '/build/',
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname),
    },
    compress: true,
    port: 9000,
    host: '0.0.0.0',
    historyApiFallback: true
  },
  externals: {
    // react: {
    //   commonjs: 'react',
    //   commonjs2: 'react',
    //   amd: 'react',
    //   root: 'React'
    // },
    // 'react-dom': {
    //   commonjs: 'react-dom',
    //   commonjs2: 'react-dom',
    //   amd: 'react-dom',
    //   root: 'ReactDOM'
    // },
    // 'pixi.js': {
    //   commonjs: 'pixi.js',
    //   commonjs2: 'pixi.js',
    //   amd: 'pixi.js',
    //   root: 'PIXI'
    // },
    // three: {
    //   commonjs: 'THREE',
    //   commonjs2: 'THREE',
    //   amd: 'THREE',
    //   root: 'THREE',
    // },
  },
  module: {
    rules: [{
      test: /\.less$/,
      use: [{
        loader: 'style-loader',
      }, {
        loader: 'css-loader',
      }, {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            parser: 'postcss',
            plugins: () => [
              require('postcss-flexbugs-fixes'),
              require('autoprefixer')({
                flexbox: 'no-2009',
              }),
            ],
          }
        }
      }, {
        loader: 'less-loader',
        options: {
          lessOptions: {
            javascriptEnabled: true,
          }
        }
      }]
    }, {
      test: /\.css$/,
      use: [{
        loader: 'style-loader',
      }, {
        loader: 'css-loader',
      }, {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            parser: 'postcss',
            plugins: () => [
              require('postcss-flexbugs-fixes'),
              require('autoprefixer')({
                flexbox: 'no-2009',
              }),
            ],
          }
        }
      }]
    }, {
      test: /\.js[x]?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          configFile: path.resolve(__dirname, './.babelrc.js'),
        }
      }
    }, {
      test: /\.ts[x]?$/,
      exclude: /node_modules/,
      use: [{
        loader: 'babel-loader',
        options: {
          configFile: path.resolve(__dirname, './.babelrc.js'),
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
  plugins,
};
