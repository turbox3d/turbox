import React from 'react';
import { Alert, Button } from 'antd';
import { ReactiveReact } from '@turbox3d/turbox';
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
    imageBuilderStore.document.clear();
  };
  const dump = () => {
    const json = imageBuilderStore.document.dumpData();
    onSave(json);
  };

  const selected = appCommandManager.default.select.getSelectedEntities()[0];
  const showInvalidRangeFrame = imageBuilderStore.scene.isShowInvalidRangeFrame();

  return (
    <div className="top-bar">
      <div>Demo Builder</div>
      <div>
        <Button size="small" onClick={undo}>
          撤销
        </Button>
        <Button size="small" onClick={redo}>
          恢复
        </Button>
        <Button size="small" onClick={clear}>
          清空
        </Button>
      </div>
      <div>
        <Button size="small" onClick={dump} disabled={showInvalidRangeFrame}>
          保存
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
