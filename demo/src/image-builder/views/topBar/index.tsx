import React from 'react';
import { Alert, Button } from 'antd';
import { ReactiveReact } from '@turbox3d/turbox';
import { UndoOutlined, RedoOutlined } from '@ant-design/icons';
import './index.less';
import { imageBuilderStore } from '../../models';
import { appCommandManager } from '../../commands';
import { IDocumentData } from '../../models/domain/document';

export const TopBar = ReactiveReact(({ onSave }: { onSave: (json?: IDocumentData) => void }) => {
  const undo = () => {
    imageBuilderStore.document.undo();
  };
  const redo = () => {
    imageBuilderStore.document.redo();
  };
  const clear = () => {
    imageBuilderStore.document.clearItemEntities();
  };
  const dump = () => {
    appCommandManager.default.select.clearAllSelected();
    const json = imageBuilderStore.document.dumpData();
    imageBuilderStore.document.clear();
    imageBuilderStore.document.clearTimeTravel();
    onSave(json);
  };

  const selected = appCommandManager.default.select.getSelectedEntities()[0];
  const showInvalidRangeFrame = imageBuilderStore.scene.isShowInvalidRangeFrame();

  return (
    <div className="top-bar">
      <div>ImageBuilder</div>
      <div className="action">
        <Button className="button" size="small" disabled={!imageBuilderStore.document.undoable} onClick={undo}>
          <UndoOutlined />
        </Button>
        <Button className="button" size="small" disabled={!imageBuilderStore.document.redoable} onClick={redo}>
          <RedoOutlined />
        </Button>

        <Button className="button" size="small" onClick={clear}>
          Clear Canvas
        </Button>
        <Button className="button" size="small" onClick={dump} disabled={showInvalidRangeFrame}>
          Save
        </Button>
      </div>

      {selected && (
        <div className="global-msg">
          <Alert message="按住 Ctrl 可固定左上角进行拉伸" type="info" />
        </div>
      )}
      {showInvalidRangeFrame && (
        <div className="global-msg">
          <Alert message="素材超出画布范围" type="error" />
        </div>
      )}
    </div>
  );
});
