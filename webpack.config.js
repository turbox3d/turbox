const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const pkg = require(path.join(process.cwd(), 'package.json'));
const pkgKey = pkg.name.replace('@turbox3d/', '');

function toCamelCase(str) {
  const lowerStr = str.toLowerCase();
  const firstUpperStr = lowerStr.substr(0, 1).toUpperCase() + lowerStr.substr(1);
  return firstUpperStr.replace(/-(.)/g, function (match, group1) {
    return group1.toUpperCase();
  });
}

module.exports = {
  entry: ['./es/index.js'],
  output: {
    path: path.resolve(process.cwd(), './dist'),
    filename: `index${process.env.NODE_ENV === 'production' ? '.min' : ''}.js`,
    library: {
      commonjs: pkg.name,
      amd: pkg.name,
      root: toCamelCase(pkgKey),
    },
    libraryTarget: 'umd'
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React'
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM'
    },
    'pixi.js': {
      commonjs: 'pixi.js',
      commonjs2: 'pixi.js',
      amd: 'pixi.js',
      root: 'PIXI'
    },
    three: {
      commonjs: 'THREE',
      commonjs2: 'THREE',
      amd: 'THREE',
      root: 'THREE',
    },
  },
  module: {
    rules: [{
      test: /\.less$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
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
    }]
  },
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx']
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
};
