/* tslint-disable */
import { Button, InputNumber, Upload } from 'antd';
import { UploadChangeParam, UploadFile } from 'antd/lib/upload';
import debounce from 'lodash/debounce';
import * as React from 'react';

import './index.scss';
import { appCommandManager } from '../../commands/index';
import { useMaterialDragAndReplace } from '../../hooks/index';
import { FrameEntity } from '../../models/entity/frame';
import { imageBuilderStore } from '../../models/index';

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

// eslint-disable-next-line max-lines-per-function
export function LeftPanel() {
  const { dragControl } = useMaterialDragAndReplace();
  const [width, setWidth] = React.useState(375);
  const [height, setHeight] = React.useState(667);
  const pointerDownHandler = (url: string, itemId: number | string) => (e: React.PointerEvent) => {
    e.persist();
    dragControl.current.onMouseDown(url)(e.nativeEvent);
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
    }
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
        // texture: new Blob([buffer], { type: info.file.type }),
        texture: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/bg_rotate.jpeg',
      });
    }
  };
  const widthChange = (value: number) => {
    setWidth(value);
    const target = Array.from(imageBuilderStore.document.models.values()).filter(m => m instanceof FrameEntity)[0] as
      | FrameEntity
      | undefined;
    appCommandManager.actionsCommand.addFrameEntity({
      size: { x: value, y: height },
      target,
    });
  };
  const heightChange = (value: number) => {
    setHeight(value);
    const target = Array.from(imageBuilderStore.document.models.values()).filter(m => m instanceof FrameEntity)[0] as
      | FrameEntity
      | undefined;
    appCommandManager.actionsCommand.addFrameEntity({
      size: { x: width, y: value },
      target,
    });
  };

  return (
    <div className="left-panel">
      <div className="material">
        {images.map(item => (
          <div key={item.name} className="img-list" onPointerDown={pointerDownHandler(item.url, item.name)}>
            <span>{item.name}</span>
            <img draggable={false} alt={item.name} title={item.name} src={item.url} width={60} height={60} />
          </div>
        ))}
      </div>
      <div className="background">
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
        <div>
          <Upload onChange={uploadImgChange} maxCount={1}>
            <Button>Click to Upload</Button>
          </Upload>
        </div>
      </div>
    </div>
  );
}
