import React from 'react';
import { Slider, Tooltip } from 'antd';
import { ReactiveReact } from '@turbox3d/turbox';
import { SyncOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import './index.less';
import { imageBuilderStore } from '../../models';

export const BottomBar = ReactiveReact(() => {
  const [min, max] = imageBuilderStore.scene.canvasZoomRange;
  const sceneTool = imageBuilderStore.scene.sceneTools;
  if (!sceneTool) {
    return null;
  }
  const scaleScene = (ratio: number) => {
    const rootView = sceneTool.getRootView();
    rootView.scale.x = ratio;
    rootView.scale.y = ratio;
    imageBuilderStore.scene.$update({
      canvasZoom: ratio,
    });
  };
  const resetView = () => {
    const rootView = sceneTool.getRootView();
    rootView.position.x = 0;
    rootView.position.y = 0;
    rootView.scale.x = 1;
    rootView.scale.y = 1;
    imageBuilderStore.scene.$update({
      canvasZoom: 1,
    });
  };

  return (
    <div className="bottom-bar">
      <div className="action-item">
        <Tooltip title="Zoom Out">
          <ZoomOutOutlined />
        </Tooltip>
        <Slider className="slider" value={imageBuilderStore.scene.canvasZoom} min={min} max={max} step={0.1} onChange={scaleScene} />
        <Tooltip title="Zoom In">
          <ZoomInOutlined />
        </Tooltip>
      </div>
      <div className="action-item reset" onClick={resetView}>
        <Tooltip title="Reset View">
          <SyncOutlined />
        </Tooltip>
      </div>
    </div>
  );
});
