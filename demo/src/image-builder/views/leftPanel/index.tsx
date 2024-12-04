/* tslint-disable */
import { Button, Input, InputNumber, Upload } from 'antd';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload';
import debounce from 'lodash/debounce';
import * as React from 'react';

import './index.less';
import { appCommandManager } from '../../commands/index';
import { useMaterialDragAndReplace } from '../../hooks/index';
import { FrameEntity } from '../../models/entity/frame';
import { imageBuilderStore } from '../../models/index';
import { Z_INDEX_ACTION } from '../../common/consts/action';

const images = [
  {
    name: 'wardrobe',
    url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/wardrobe.png',
  },
  {
    name: 'sofa',
    url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/sofa.png',
  },
  {
    name: 'light',
    url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/light.png',
  },
  {
    name: 'desk',
    url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/desk.png',
  },
  {
    name: 'chair',
    url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/chair.png',
  },
  {
    name: 'art',
    url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/art.png',
  },
];

const textUrl = 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/text.jpeg';

// eslint-disable-next-line max-lines-per-function
export function LeftPanel() {
  const { dragControl } = useMaterialDragAndReplace();
  const [width, setWidth] = React.useState(375);
  const [height, setHeight] = React.useState(667);
  const pointerDownHandler = (url: string, name: number | string) => (e: React.PointerEvent) => {
    e.persist();
    dragControl.current.onMouseDown(url, { name })(e.nativeEvent);
  };
  const colorChange: React.ChangeEventHandler<HTMLInputElement> | undefined = debounce(
    (e: React.BaseSyntheticEvent) => {
      const target = Array.from(imageBuilderStore.document.models.values()).filter(m => m instanceof FrameEntity)[0] as
        | FrameEntity
        | undefined;
      appCommandManager.actionsCommand.addFrameEntity({
        size: { x: width, y: height },
        target,
        color: parseInt(e.target.value.replace('#', '0x'), 16),
      });
    },
    300
  );
  const uploadImgChange = async (info: UploadChangeParam<UploadFile<any>>) => {
    if (info.file.status === 'done') {
      const target = Array.from(imageBuilderStore.document.models.values()).filter(m => m instanceof FrameEntity)[0] as
        | FrameEntity
        | undefined;
      const buffer = await info.file.originFileObj?.arrayBuffer();
      if (!buffer) {
        return;
      }
      appCommandManager.actionsCommand.addFrameEntity({
        size: { x: width, y: height },
        target,
        texture: new Blob([buffer], { type: info.file.type }),
      });
    }
  };
  const widthChange = debounce(
    (value: number) => {
      setWidth(value);
      const target = Array.from(imageBuilderStore.document.models.values()).filter(m => m instanceof FrameEntity)[0] as
        | FrameEntity
        | undefined;
      appCommandManager.actionsCommand.addFrameEntity({
        size: { x: value, y: height },
        target,
      });
    },
    300
  );
  const heightChange = debounce(
    (value: number) => {
      setHeight(value);
      const target = Array.from(imageBuilderStore.document.models.values()).filter(m => m instanceof FrameEntity)[0] as
        | FrameEntity
        | undefined;
      appCommandManager.actionsCommand.addFrameEntity({
        size: { x: width, y: value },
        target,
      });
    },
    300
  );
  const pointerDownTextHandler = (e: React.PointerEvent) => {
    appCommandManager.actionsCommand.addTextItemEntity('hello world!');
  };
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
  const updateZ = (type: Z_INDEX_ACTION) => () => {
    appCommandManager.actionsCommand.updateRenderOrder(type);
  };

  return (
    <div className="left-panel">
      <div>
        <Button size="small" onClick={undo}>撤销</Button>
        <Button size="small" onClick={redo}>恢复</Button>
        <Button size="small" onClick={clear}>清空</Button>
        <br/>
        <Button size="small" onClick={dump}>保存</Button>
        <Button size="small" onClick={load}>加载</Button>
        <br/>
        <Button size="small" className="op" onClick={updateZ(Z_INDEX_ACTION.TOP)}>
          置顶
        </Button>
        <Button size="small" className="op" onClick={updateZ(Z_INDEX_ACTION.INCREASE)}>
          上移
        </Button>
        <Button size="small" className="op" onClick={updateZ(Z_INDEX_ACTION.DECREASE)}>
          下移
        </Button>
        <Button size="small" className="op" onClick={updateZ(Z_INDEX_ACTION.BOTTOM)}>
          置底
        </Button>
      </div>
      <div className="background-wp">
        <h4>背景框</h4>
        <div>
          宽度
          <InputNumber value={width} onChange={widthChange} />
        </div>
        <div>
          高度
          <InputNumber value={height} onChange={heightChange} />
        </div>
        <div>
          颜色
          <input type="color" onChange={colorChange} />
        </div>
        {/* <div>
          <Upload onChange={uploadImgChange} maxCount={1}>
            <Button>Click to Upload</Button>
          </Upload>
        </div> */}
      </div>
      <div className="material-wp">
        <h4>图片素材</h4>
        <div className="material">
          {images.map(item => (
            <div key={item.name} className="img-list" onPointerDown={pointerDownHandler(item.url, item.name)}>
              <span>{item.name}</span>
              <img draggable={false} alt={item.name} title={item.name} src={item.url} width={60} height={60} />
            </div>
          ))}
        </div>
      </div>
      <div className="text-wp">
        <h4>文本素材</h4>
        <div className="img-list" onPointerDown={pointerDownTextHandler}>
          <img draggable alt="text" src={textUrl} width={30} height={30} />
        </div>
      </div>
      <div className="hero-wp">
        <h4>图文混合素材</h4>
        <div className="img-list" onPointerDown={pointerDownTextHandler}>
          <span>图文混合素材1</span>
          <span>图文混合素材2</span>
        </div>
      </div>
      <div className="layout-wp">
        <h4>模版方案</h4>
        <div className="img-list" onPointerDown={pointerDownTextHandler}>
          <span>模版1</span>
          <span>模版2</span>
        </div>
      </div>
    </div>
  );
}
