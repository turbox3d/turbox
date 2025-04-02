/* tslint-disable */
import { Button, Divider } from 'antd';
import * as React from 'react';
import { FileImageOutlined } from '@ant-design/icons';

import './index.less';
import { appCommandManager } from '../../commands/index';
import { useMaterialDragAndReplace } from '../../hooks/index';
import { Z_INDEX_ACTION } from '../../common/consts/action';
import { ItemType } from '../../common/consts/scene';

// const images = [
//   {
//     name: 'wardrobe',
//     url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/wardrobe.png',
//   },
//   {
//     name: 'sofa',
//     url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/sofa.png',
//   },
//   {
//     name: 'light',
//     url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/light.png',
//   },
//   {
//     name: 'desk',
//     url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/desk.png',
//   },
//   {
//     name: 'chair',
//     url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/chair.png',
//   },
//   {
//     name: 'art',
//     url: 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/art.png',
//   },
// ];

// const textUrl = 'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/text.jpeg';

// eslint-disable-next-line max-lines-per-function
export function LeftPanel() {
  const { dragControl } = useMaterialDragAndReplace<{ type: string; name?: number | string; }>();
  // const [width, setWidth] = React.useState(375);
  // const [height, setHeight] = React.useState(667);
  const pointerDownHandler = (url: string, type: string, name?: number | string) => (e: React.PointerEvent) => {
    e.persist();
    dragControl.current.onMouseDown(url, { name, type })(e.nativeEvent);
  };
  // const colorChange: React.ChangeEventHandler<HTMLInputElement> | undefined = debounce(
  //   (e: React.BaseSyntheticEvent) => {
  //     const target = imageBuilderStore.document.getFrameEntities[0] as FrameEntity | undefined;
  //     appCommandManager._shared.entity.addFrameEntity({
  //       size: { x: width, y: height },
  //       target,
  //       color: parseInt(e.target.value.replace('#', '0x'), 16),
  //     });
  //   },
  //   300
  // );
  // const uploadImgChange = async (info: UploadChangeParam<UploadFile<any>>) => {
  //   if (info.file.status === 'done') {
  //     const target = imageBuilderStore.document.getFrameEntities[0] as FrameEntity | undefined;
  //     const buffer = await info.file.originFileObj?.arrayBuffer();
  //     if (!buffer) {
  //       return;
  //     }
  //     appCommandManager._shared.entity.addFrameEntity({
  //       size: { x: width, y: height },
  //       target,
  //       texture: new Blob([buffer], { type: info.file.type }),
  //     });
  //   }
  // };
  // const widthChange = debounce((value: number) => {
  //   setWidth(value);
  //   const target = imageBuilderStore.document.getFrameEntities[0] as FrameEntity | undefined;
  //   appCommandManager._shared.entity.addFrameEntity({
  //     size: { x: value, y: height },
  //     target,
  //   });
  // }, 300);
  // const heightChange = debounce((value: number) => {
  //   setHeight(value);
  //   const target = imageBuilderStore.document.getFrameEntities[0] as FrameEntity | undefined;
  //   appCommandManager._shared.entity.addFrameEntity({
  //     size: { x: width, y: value },
  //     target,
  //   });
  // }, 300);
  const updateZ = (type: Z_INDEX_ACTION) => () => {
    appCommandManager._shared.entity.updateRenderOrder(type);
  };

  return (
    <div className="left-panel">
      <div className="divider-container">
        <Divider orientation="left">Blocks</Divider>
        <div className="flex-horizontal">
          <div
            className="block"
            onPointerDown={pointerDownHandler(
              'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/text.jpeg',
              ItemType.TEXT,
            )}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#000000"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: 40, height: 25 }}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.1001 6.39961C3.1001 4.57707 4.57756 3.09961 6.4001 3.09961H17.6001C19.4226 3.09961 20.9001 4.57707 20.9001 6.39961V17.5996C20.9001 19.4221 19.4226 20.8996 17.6001 20.8996H6.4001C4.57756 20.8996 3.1001 19.4221 3.1001 17.5996V6.39961ZM6.4001 4.89961C5.57167 4.89961 4.9001 5.57118 4.9001 6.39961V17.5996C4.9001 18.428 5.57167 19.0996 6.4001 19.0996H17.6001C18.4285 19.0996 19.1001 18.428 19.1001 17.5996V6.39961C19.1001 5.57118 18.4285 4.89961 17.6001 4.89961H6.4001ZM8.1001 8.99961C8.1001 8.50255 8.50304 8.09961 9.0001 8.09961H15.0001C15.4972 8.09961 15.9001 8.50255 15.9001 8.99961C15.9001 9.49667 15.4972 9.89961 15.0001 9.89961H12.9001V14.9996C12.9001 15.4967 12.4972 15.8996 12.0001 15.8996C11.503 15.8996 11.1001 15.4967 11.1001 14.9996V9.89961H9.0001C8.50304 9.89961 8.1001 9.49667 8.1001 8.99961Z"
                fill="#000000"
              />
            </svg>
            <div className="text">Text</div>
          </div>
          <div
            className="block"
            onPointerDown={pointerDownHandler(
              'https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/edm/sofa.png',
              ItemType.IMAGE,
            )}
          >
            <FileImageOutlined style={{ fontSize: 18, height: 25 }} />
            <div className="text">Image</div>
          </div>
          <div className="block" onPointerDown={pointerDownHandler('https://sf16-va.tiktokcdn.com/obj/eden-va2/uhmplmeh7uhmplmbn/button.svg', ItemType.BUTTON)}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 25 }}>
              <path
                d="M22 9v6c0 1.1-.9 2-2 2h-1v-2h1V9H4v6h6v2H4c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-7.5 10l1.09-2.41L18 15.5l-2.41-1.09L14.5 12l-1.09 2.41L11 15.5l2.41 1.09L14.5 19zm2.5-5l.62-1.38L19 12l-1.38-.62L17 10l-.62 1.38L15 12l1.38.62L17 14zm-2.5 5l1.09-2.41L18 15.5l-2.41-1.09L14.5 12l-1.09 2.41L11 15.5l2.41 1.09L14.5 19zm2.5-5l.62-1.38L19 12l-1.38-.62L17 10l-.62 1.38L15 12l1.38.62L17 14z"
                fill="#323232"
              />
            </svg>
            <div className="text">Button</div>
          </div>
        </div>
      </div>
      {/* <div className="divider-container">
        <Divider orientation="left">Container</Divider>
        <div className="container-config-item">
          <span className="container-config-text">Width</span>
          <InputNumber value={width} onChange={widthChange} style={{ width: 200 }} />
        </div>
        <div className="container-config-item">
          <span className="container-config-text">Height</span>
          <InputNumber value={height} onChange={heightChange} style={{ width: 200 }} />
        </div>
        <div className="container-config-item">
          <span className="container-config-text">Color</span>
          <input type="color" onChange={colorChange} style={{ width: 200 }} />
        </div>
      </div> */}
      <div className="divider-container">
        <Divider orientation="left">Layer Level</Divider>
        <div className="container-config-item">
          <span className="container-config-text">Config</span>
          <div className="btn-group">
            <Button size="small" className="op" onClick={updateZ(Z_INDEX_ACTION.TOP)} style={{ height: 30, width: 80 }}>
              Move Top
            </Button>
            <Button size="small" className="op" onClick={updateZ(Z_INDEX_ACTION.INCREASE)} style={{ height: 30 }}>
              Move Up
            </Button>
            <Button size="small" className="op" onClick={updateZ(Z_INDEX_ACTION.DECREASE)} style={{ height: 30 }}>
              Move Down
            </Button>
            <Button size="small" className="op" onClick={updateZ(Z_INDEX_ACTION.BOTTOM)} style={{ height: 30 }}>
              Move Bottom
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
