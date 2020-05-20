import { createApp } from './atom';
import { init } from 'turbox';

init();

createApp({
  name: 'tpzz',
  meta: {},
  preload: {
    range: 2,
  },
  getConfig: async () => {
    // const configJson = await fetch('osskey');
    // return configJson;
    return {
      'TPZZ_PLUGINA': 'http://localhost:9001/build/bundle.js',
      'TPZZ_PLUGINB': 'http://localhost:9002/build/bundle.js',
    };
  },
  plugins: () => {
    return ['TPZZ_PLUGINA', 'TPZZ_PLUGINB'];
  }
});

// createApp({
//   name: 'hs',
//   meta: {},
//   plugins: ['TPZZ_PLUGINA', 'TPZZ_PLUGINB'],
// });
