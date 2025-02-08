import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import * as THREE from 'three';

import { config, Tolerance, EnvSystem } from '@turbox3d/turbox';
import { IDocumentData } from './image-builder/models/domain/document';
import { ItemType } from './image-builder/common/consts/scene';
import { BLACK } from './image-builder/common/consts/color';

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

const imageBuilderData = {
  container: {
    width: 375,
    height: 375,
  },
  items: [{
    type: ItemType.IMAGE,
    top: 0,
    left: 0,
    width: 180.5,
    height: 57.51896813353566,
    zIndex: 3,
    data: {
      content: '',
      src: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/sofa.png',
      href: '',
      attribute: {
        fontSize: 30,
        lineHeight: 30,
        fontFamily: 'Arial',
        color: BLACK,
        fontWeight: 'normal',
        align: 'left',
        wordWrap: true,
        wordWrapWidth: 400,
      },
    }
  }],
} as IDocumentData;

const root = createRoot(document.getElementById('app')!);
root.render(
  <BrowserRouter>
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<DataFlow />} />
        <Route path="/image-builder" element={<ImageBuilder handleSave={(json?: IDocumentData) => {
          console.log(json);
        }} data={imageBuilderData} />} />
        <Route path="/lite-design" element={<LiteDesign />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);
