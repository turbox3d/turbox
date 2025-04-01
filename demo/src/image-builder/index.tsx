import * as React from 'react';

import { depCollector, render, g, Scene2D, SceneTool } from '@turbox3d/turbox';
import { FPSMonitorComponent } from '@turbox3d/turbox-dev-tool';

import './common/styles/base.less';
import './index.less';
import { appCommandManager } from './commands/index';
import { imageBuilderStore } from './models/index';
import { LeftPanel } from './views/leftPanel/index';
import { World } from './views/world';
import { TopBar } from './views/topBar';
import { IDocumentData } from './models/domain/document';
import { RightPanel } from './views/rightPanel';

window.$$DEBUG = {
  depCollector,
  appCommandManager,
  imageBuilderStore,
};

imageBuilderStore.document.createHistory(20);
imageBuilderStore.document.applyHistory();

const updateSceneSize = () => {
  const domElement = document.getElementById('scene2d');
  imageBuilderStore.scene.$update({
    sceneSize: { width: domElement!.clientWidth, height: domElement!.clientHeight },
  });
};

interface IImageBuilderProps {
  handleSave: (json?: IDocumentData) => void;
  data: IDocumentData | null;
}

const ImageBuilder = ({ handleSave, data }: IImageBuilderProps) => {
  React.useEffect(() => {
    updateSceneSize();
    window.addEventListener('resize', () => {
      updateSceneSize();
    });
    render([
      g(Scene2D, {
        id: 'scene2d',
        draggable: true,
        scalable: true,
        container: 'scene2d',
        transparent: true,
        commandMgr: appCommandManager,
        cameraPosition: { x: 0, y: 0 },
        resizeTo: 'scene2d',
        maxFPS: 120,
        disableResize: false,
        resolution: imageBuilderStore.scene.resolution,
        renderFlag: imageBuilderStore.scene.renderFlag2d,
        initialized: (sceneTools: SceneTool) => {
          imageBuilderStore.scene.setSceneTools(sceneTools);
        },
        children: [g(World)],
      }),
    ]);
  }, []);

  React.useEffect(() => {
    if (data) {
      imageBuilderStore.document.loadData(data);
    }
  }, [data]);

  return (
    <>
      <div
        id="scene2d"
        style={{
          position: 'absolute',
          top: 72,
          right: 0,
          bottom: 0,
          left: 260,
        }}
      />
      <LeftPanel />
      <RightPanel />
      <TopBar onSave={handleSave} />
      {process.env.NODE_ENV === 'development' && <FPSMonitorComponent className="fps-monitor" />}
    </>
  );
};

export default ImageBuilder;
