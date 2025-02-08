import React from 'react';
import { Alert, Button } from 'antd';
import { ReactiveReact } from '@turbox3d/turbox';
import './index.less';
import { imageBuilderStore } from '../../models';
import { appCommandManager } from '../../commands';
import { ItemType } from '../../common/consts/scene';
import { BLACK } from '../../common/consts/color';

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
    const json = imageBuilderStore.document.dumpData();
    console.log(json);
  };
  const load = () => {
    const json = {
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
    };
    imageBuilderStore.document.loadData(json as any);
  };
  const selected = appCommandManager.defaultCommand.select.getSelectedEntities()[0];
  const showInvalidRangeFrame = imageBuilderStore.scene.isShowInvalidRangeFrame();

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
      {showInvalidRangeFrame && (
        <div className="global-msg">
          <Alert message="素材超出画布范围" type="error" />
        </div>
      )}
    </div>
  )
});
