import React from 'react';
import { Alert, Button } from 'antd';
import { ReactiveReact } from '@turbox3d/turbox';
import './index.less';
import { imageBuilderStore } from '../../models';
import { appCommandManager } from '../../commands';

export const TopBar = ReactiveReact(() => {
  const undo = () => {
    imageBuilderStore.document.undo();
  };
  const redo = () => {
    imageBuilderStore.document.redo();
  };
  const clear = () => {
    imageBuilderStore.document.clear();
  };
  const dump = () => {

  };
  const load = () => {

  };
  const selected = appCommandManager.defaultCommand.select.getSelectedEntities()[0];

  return (
    <div className="top-bar">
      <div>Demo Builder</div>
      <div>
        <Button size="small" onClick={undo}>撤销</Button>
        <Button size="small" onClick={redo}>恢复</Button>
        <Button size="small" onClick={clear}>清空</Button>
      </div>
      <div>
        <Button size="small" onClick={dump}>保存</Button>
        <Button size="small" onClick={load}>加载</Button>
      </div>
      {selected && (
        <div className="global-msg">
          <Alert message="按住 Ctrl 可固定左上角进行拉伸" type="info" />
        </div>
      )}
    </div>
  )
});
