import * as React from 'react';

import { depCollector } from '@turbox3d/turbox';

import { appCommandManager } from './commands/index';
import { ldeStore } from './models/index';
import { LeftPanel } from './views/leftPanel/index';
import { MainScene } from './views/scene';
import './common/styles/base.less';
import { SceneUtil } from './views/scene/modelsWorld/index';

window.$$DEMO_DEBUG = {
  appCommandManager,
  ldeStore,
  SceneUtil,
  depCollector,
};

ldeStore.document.createHistory(20);
ldeStore.document.applyHistory();

export const Demo = () => (
  <>
    <MainScene
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: '75%',
      }}
      mode="perspective"
    />
    <LeftPanel />
  </>
);

export default Demo;
