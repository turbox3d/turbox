var path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const plugins = [];
if (process.env.NODE_ENV !== 'production') {
  plugins.push(new BundleAnalyzerPlugin());
}

module.exports = {
  entry: {
    app: [path.resolve(__dirname, './src/main.tsx')]
  },
  mode: 'development',
  output: {
    path: path.join(process.cwd(), process.env.BUILD_DEST || '../build'),
    filename: 'bundle.js',
    publicPath: "/build/",
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname),
    },
    compress: true,
    port: 9000,
    host: '0.0.0.0'
  },
  externals: {
    // turbox: {
    //   commonjs: 'turbox',
    //   commonjs2: 'turbox',
    //   amd: 'turbox',
    //   root: 'Turbox'
    // },
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
    // turbox: 'Turbox',
    // react: 'React',
    // 'react-dom': 'ReactDOM',
  },
  module: {
    rules: [{
      // include: [
      //   path.resolve(__dirname, 'es')
      // ],
      test: /\.less$/,
      use: [{
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
  plugins,
};
