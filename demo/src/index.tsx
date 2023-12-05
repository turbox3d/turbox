import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import * as THREE from 'three';

import { config, Tolerance, EnvSystem } from '@turbox3d/turbox';
import DataFlow from './data-flow/index';

config({
  middleware: {
    logger: false,
    perf: false,
  },
  // devTool: process.env.NODE_ENV === 'development',
});

window.THREE = THREE;

const TOLERANCE = 1e-3;
Tolerance.setGlobal(TOLERANCE, TOLERANCE, TOLERANCE);

EnvSystem.AppEnvMgr.switchAppEnv('lite-design');

const Demo = lazy(() => import('./demo'));
const ImageBuilder = lazy(() => import('./image-builder'));

ReactDOM.render(
  <BrowserRouter
    basename={process.env.NODE_ENV === 'production' ? `/${process.env.REGION}/ug/web_game` : '/va/ug/web_game'}
  >
    <Suspense fallback={<div>Loading...</div>}>
      <Route exact path="/" component={Demo} />
      <Route exact path="/image-builder" component={ImageBuilder} />
      <Route exact path="/data-flow" component={DataFlow} />
    </Suspense>
  </BrowserRouter>,
  document.getElementById('app')
);
