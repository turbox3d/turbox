import * as React from 'react';

import { depCollector, render, g, Scene2D, SceneTool } from '@turbox3d/turbox';
import { FPSMonitorComponent } from '@turbox3d/turbox-dev-tool';

import './common/styles/base.less';
import './index.less';
import { appCommandManager } from './commands/index';
import { imageBuilderStore } from './models/index';
import { LeftPanel } from './views/leftPanel/index';
import { TopBar } from './views/topBar';
import { IDocumentData } from './models/domain/document';
import { RightPanel } from './views/rightPanel';
import { BottomBar } from './views/bottomBar';
import { ViewEntity } from './views/world/entity';
import { SnapLine } from './views/world/snapLine';
import { RangeLine } from './views/world/rangeLine';
import { Grid } from './views/world/grid';
import { HintLine } from './views/world/hintLine';
import { Gizmo } from './views/world/gizmo';

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
  showImageBuilder?: boolean;
  data: IDocumentData | null;
}

function ImageBuilder({ handleSave, showImageBuilder = true, data }: IImageBuilderProps) {
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
        commandMgr: appCommandManager,
        cameraPosition: imageBuilderStore.scene.cameraPosition,
        resizeTo: 'scene2d',
        maxFPS: 120,
        disableResize: false,
        resolution: imageBuilderStore.scene.resolution,
        renderFlag: imageBuilderStore.scene.renderFlag2d,
        initialized: (sceneTools: SceneTool) => {
          imageBuilderStore.scene.setSceneTools(sceneTools);
        },
        zoomRange: imageBuilderStore.scene.canvasZoomRange,
        children: [
          g(Grid),
          g(ViewEntity),
          g(Gizmo),
          g(HintLine),
          g(SnapLine),
          g(RangeLine),
        ],
      }),
    ]);
  }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      appCommandManager.default.select.clearAllSelected();
      imageBuilderStore.document.clear();
      imageBuilderStore.document.clearHistory();
      if (data && showImageBuilder) {
        await imageBuilderStore.document.loadData(data);
      }
    };
    fetchData();
  }, [data, showImageBuilder]);

  return (
    <>
      <div
        id="scene2d"
        style={{
          position: 'absolute',
          top: 72,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />
      <LeftPanel />
      <RightPanel />
      <TopBar onSave={handleSave} />
      <BottomBar />
      {process.env.NODE_ENV === 'development' && <FPSMonitorComponent className="fps-monitor" />}
    </>
  );
}

export default ImageBuilder;
