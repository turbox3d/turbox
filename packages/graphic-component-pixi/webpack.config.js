const path = require('path');
const pkg = require(path.join(process.cwd(), 'package.json'));

module.exports = {
  entry: [
    './es/index.js',
  ],
  output: {
    library: {
      commonjs: pkg.name,
      amd: pkg.name,
      root: 'TurboxGraphicComponentPixi'
    },
    libraryTarget: 'umd',
  },
  externals: {
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
