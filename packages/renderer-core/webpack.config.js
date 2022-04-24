const path = require('path')
const pkg = require(path.join(process.cwd(), 'package.json'));

module.exports = {
  entry: ['./es/index.js'],
  output: {
    library: {
      commonjs: pkg.name,
      amd: pkg.name,
      root: 'TurboxRendererCore'
    },
    libraryTarget: 'umd'
  },
  // externals: {
  //   react: {
  //     commonjs: 'react',
  //     commonjs2: 'react',
  //     amd: 'react',
  //     root: 'React'
  //   },
  //   'react-dom': {
  //     commonjs: 'react-dom',
  //     commonjs2: 'react-dom',
  //     amd: 'react-dom',
  //     root: 'ReactDOM'
  //   },
  // },
  // module: {
  //   rules: [{
  //     include: [
  //       path.resolve(__dirname, 'src')
  //     ],
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
};
