const path = require('path');
// const fs = require('fs');
const pkg = require(path.join(process.cwd(), 'package.json'));

// function getEntries(dir) {
//   const entries = [];
//   fs.readdirSync(dir).forEach((file) => {
//     var pathname = path.join(dir, file);
//     if (fs.statSync(pathname).isDirectory()) {
//
//     } else {
//       entries.push(pathname);
//     }
//   })
//   return entries;
// }

module.exports = {
  entry: [
    './es/index.js',
  ],
  output: {
    library: {
      commonjs: pkg.name,
      amd: pkg.name,
      root: 'TurboxDesignEngine'
    },
    libraryTarget: 'umd',
    // path: path.resolve(__dirname, 'es'),
    // filename: '[name].js',
    // chunkFilename: '[name].js',
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
    }
  },
  // module: {
  //   rules: [{
  //     // include: [
  //     //   path.resolve(__dirname, 'es')
  //     // ],
  //     test: /\.less$/,
  //     use: [{
  //       loader: MiniCssExtractPlugin.loader,
  //     }, {
  //       loader: 'css-loader',
  //     }, {
  //       loader: 'postcss-loader',
  //       options: {
  //         postcssOptions: {
  //           parser: 'postcss',
  //           plugins: () => [
  //             require('postcss-flexbugs-fixes'),
  //             require('autoprefixer')({
  //               flexbox: 'no-2009',
  //             }),
  //           ],
  //         }
  //       }
  //     }, {
  //       loader: 'less-loader',
  //       options: {
  //         lessOptions: {
  //           javascriptEnabled: true,
  //         }
  //       }
  //     }]
  //   }, {
  //     // include: [
  //     //   path.resolve(__dirname, 'es')
  //     // ],
  //     test: /\.ts[x]?$/,
  //     use: [{
  //       loader: 'babel-loader'
  //     }, {
  //       loader: 'ts-loader',
  //       options: {
  //         configFile: path.resolve(__dirname, 'tsconfig.json')
  //       }
  //     }]
  //   }]
  // },
  // resolve: {
  //   extensions: ['.js', '.ts', '.tsx']
  // },
  // plugins: [
  //   new MiniCssExtractPlugin(),
  // ],
};
