import * as React from 'react';
import { ReactiveReact } from '@turbox3d/turbox';
import { ColorPicker, Input } from 'antd';
import './index.less';
import { appCommandManager } from '../../commands';
import { ItemEntity } from '../../models/entity/item';
import { ItemType } from '../../common/consts/scene';
import { Color } from 'antd/es/color-picker';
import { loadImageElement } from '../../common/utils/image';
import { imageBuilderStore } from '../../models';

export const RightPanel = ReactiveReact(() => {
  const selected = appCommandManager.default.select.getSelectedEntities()[0];
  if (!selected || !(selected instanceof ItemEntity)) {
    return null;
  }

  const textAttributesMap = {
    fontFamily: { text: '字体', value: selected.attribute.fontFamily, type: 'text' },
    fontSize: { text: '字号', value: selected.attribute.fontSize, disabled: true, type: 'number' },
    align: { text: '对齐', value: selected.attribute.align, type: 'text' },
    fontWeight: { text: '粗细', value: selected.attribute.fontWeight, type: 'text' },
    lineHeight: { text: '行高(倍数)', value: selected.attribute.lineHeight, type: 'number' },
    fontStyle: { text: '斜体', value: selected.attribute.fontStyle, type: 'text' },
  };
  const imgAttributesMap = {
    width: { text: '宽度', value: selected.size.x, disabled: true, type: 'number' },
    height: { text: '高度', value: selected.size.y, disabled: true, type: 'number' },
    borderRadius: { text: 'borderRadius', value: selected.attribute.borderRadius, type: 'number' },
    borderWidth: { text: 'borderWidth', value: selected.attribute.borderWidth, type: 'number' },
  };

  const onTextHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    appCommandManager._shared.updateText(e.target.value);
  };
  const onItemEntityHandler = (key: string) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    selected.$update({
      [key]: e.currentTarget.value,
    });
  };
  const onColorHandler = (key: string) => (e: Color) => {
    selected.$update({
      attribute: {
        ...selected.attribute,
        [key]: Number(e.toHexString().replace('#', '0x')),
      },
    });
  };
  const attributeHandler = (key: string) => (e) => {
    const obj = {
      ...textAttributesMap,
      ...imgAttributesMap,
    };
    const val = obj[key].type === 'number' ? Number(e.target.value) : e.target.value;
    selected.$update({
      attribute: {
        ...selected.attribute,
       [key]: val,
      },
    });
  };
  const onImgSrcHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    const url = e.currentTarget.value;
    if (!url) {
      return;
    }
    const map = await loadImageElement(url).catch(err => {
      console.error(err);
    });
    if (!map) {
      return;
    }
    selected.$update({
      imageData: map.element,
      resourceUrl: url,
    });
    const ratio = map.width / map.height;
    const bgSize = imageBuilderStore.scene.sceneSize;
    selected.setSize({
      x: ratio > 1 ? bgSize.width / 6 : (bgSize.height / 6) * ratio,
      y: ratio > 1 ? bgSize.width / 6 / ratio : bgSize.height / 6,
    });
  }

  return (
    <div className="right-panel" key={selected.id}>
      {selected.itemType === ItemType.TEXT && (
        <>
          <div>
            <div>文本</div>
            <Input.TextArea
              value={selected.text}
              onChange={onTextHandler}
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </div>
          <div>
            <div>超链接</div>
            <Input
              defaultValue={selected.href}
              onPressEnter={onItemEntityHandler('href')}
            />
          </div>
          <div>
            <div>颜色</div>
            <ColorPicker defaultValue={`#${selected.attribute.color.toString(16)}`} placement="rightBottom" disabledAlpha showText onChange={onColorHandler('color')} />
          </div>
          {Object.keys(textAttributesMap).map(key => (
            <div key={key}>
              <div>{textAttributesMap[key].text}</div>
              <Input value={`${textAttributesMap[key].value}`} type={textAttributesMap[key].type} onChange={attributeHandler(key)} disabled={textAttributesMap[key].disabled} />
            </div>
          ))}
        </>
      )}
      {selected.itemType === ItemType.IMAGE && (
        <>
          <div>
            <div>图片地址</div>
            <Input
              defaultValue={selected.resourceUrl}
              onPressEnter={onImgSrcHandler}
            />
          </div>
          <div>
            <div>超链接</div>
            <Input
              defaultValue={selected.href}
              onPressEnter={onItemEntityHandler('href')}
            />
          </div>
          {Object.keys(imgAttributesMap).map(key => (
            <div key={key}>
              <div>{imgAttributesMap[key].text}</div>
              <Input value={`${imgAttributesMap[key].value}`} type={imgAttributesMap[key].type} onChange={attributeHandler(key)} disabled={imgAttributesMap[key].disabled} />
            </div>
          ))}
          <div>
            <div>边框颜色</div>
            <ColorPicker defaultValue={`#${selected.attribute.borderColor.toString(16)}`} placement="rightBottom" disabledAlpha showText onChange={onColorHandler('borderColor')} />
          </div>
          <div>
            <div>背景颜色</div>
            <ColorPicker defaultValue={`#${selected.attribute.backgroundColor.toString(16)}`} placement="rightBottom" disabledAlpha showText onChange={onColorHandler('backgroundColor')} />
          </div>
        </>
      )}
    </div>
  );
});
