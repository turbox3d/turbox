import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import * as THREE from 'three';

import { config, Tolerance, EnvSystem } from '@turbox3d/turbox';

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

const LiteDesign = lazy(() => import('./lite-design'));
const ImageBuilder = lazy(() => import('./image-builder'));
const DataFlow = lazy(() => import('./data-flow'));

ReactDOM.render(
  <BrowserRouter>
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<DataFlow />} />
        <Route path="/image-builder" element={<ImageBuilder />} />
        <Route path="/lite-design" element={<LiteDesign />} />
      </Routes>
    </Suspense>
  </BrowserRouter>,
  document.getElementById('app')
);
