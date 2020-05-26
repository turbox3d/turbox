import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { init, createApp } from 'turbox';
import DemoBox from './component/index';

document.addEventListener("DOMContentLoaded", function (event) {
  // init();
  // createApp({
  //   name: 'tpzz',
  //   meta: {},
  //   preload: {
  //     range: 2,
  //   },
  //   getConfig: async () => {
  //     // const configJson = await fetch('osskey');
  //     // return configJson;
  //     return {
  //       'TPZZ_PLUGINA': 'http://localhost:9001/build/bundle.js',
  //       'TPZZ_PLUGINB': 'http://localhost:9002/build/bundle.js',
  //     };
  //   },
  //   plugins: () => {
  //     return ['TPZZ_PLUGINA', 'TPZZ_PLUGINB'];
  //   }
  // });
  // createApp({
  //   name: 'hs',
  //   meta: {},
  //   plugins: ['TPZZ_PLUGINA', 'TPZZ_PLUGINB'],
  // });
  ReactDOM.render(
    <DemoBox />,
    document.getElementById('app')
  );
});

