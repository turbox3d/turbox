const cjs = process.env.BABEL_ENV === 'commonjs' ? 'commonjs' : false;

const presets = [
  [
    '@babel/env',
    {
      modules: cjs,
    },
  ],
  '@babel/react',
];
const plugins = [
  [
    '@babel/plugin-transform-runtime',
    {
      useESModules: !cjs,
      // corejs: 2,
    },
  ],
];

if (cjs) {
  plugins.push('@babel/plugin-transform-modules-commonjs');
}

module.exports = (api) => {
  api && api.cache(true);
  return {
    presets,
    plugins,
  };
}
