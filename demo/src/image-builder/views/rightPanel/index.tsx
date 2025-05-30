import * as React from 'react';
import { ReactiveReact } from '@turbox3d/turbox';
import { ColorPicker, Input, Switch } from 'antd';
import './index.less';
import { Color } from 'antd/es/color-picker';
import { appCommandManager } from '../../commands';
import { ItemEntity } from '../../models/entity/item';
import { ItemType } from '../../common/consts/scene';
import { imageBuilderStore } from '../../models';
import { Attribute } from './attribute';
import { MIRROR_ACTION } from '../../common/consts/action';
import { loadImageElement } from '../../common/utils/image';

export const RightPanel = ReactiveReact(() => {
  const selected = appCommandManager.default.select.getSelectedEntities()[0];
  if (!selected || !(selected instanceof ItemEntity)) {
    return null;
  }

  const textAttributesMap = {
    fontFamily: { text: 'Font Family', value: selected.attribute.fontFamily, type: 'text' },
    fontSize: { text: 'Font Size', value: selected.attribute.fontSize, disabled: true, type: 'number' },
    align: { text: 'Align', value: selected.attribute.align, type: 'text' },
    fontWeight: { text: 'Font Weight', value: selected.attribute.fontWeight, type: 'text' },
    lineHeight: { text: 'Line Height', value: selected.attribute.lineHeight, type: 'number' },
    fontStyle: { text: 'Font Style', value: selected.attribute.fontStyle, type: 'text' },
  };
  const imgAttributesMap = {
    width: { text: 'Width', value: selected.size.x, disabled: true, type: 'number' },
    height: { text: 'Height', value: selected.size.y, disabled: true, type: 'number' },
    borderRadius: { text: 'Border Radius', value: selected.attribute.borderRadius, type: 'number' },
    borderWidth: { text: 'Border Width', value: selected.attribute.borderWidth, type: 'number' },
  };

  const onTextHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    appCommandManager._shared.entity.updateText(e.target.value);
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
  const attributeHandler = (key: string) => e => {
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
  };
  const mirror = (type: MIRROR_ACTION) => () => {
    appCommandManager._shared.entity.updateMirror(type);
  };
  const updateTransparent = (checked: boolean) => {
    selected.$update({
      attribute: {
        ...selected.attribute,
        transparent: checked,
      },
    });
  };

  return (
    <div className="right-panel" key={selected.id}>
      {selected.itemType === ItemType.TEXT && (
        <>
          <div>
            <Attribute attribute="Text" />
            <Input.TextArea value={selected.text} onChange={onTextHandler} autoSize={{ minRows: 3, maxRows: 5 }} />
          </div>
          <div>
            <Attribute attribute="Link" />
            <Input defaultValue={selected.href} onPressEnter={onItemEntityHandler('href')} />
          </div>
          <div>
            <Attribute attribute="Color" />
            <ColorPicker
              defaultValue={`#${selected.attribute.color.toString(16)}`}
              placement="rightBottom"
              disabledAlpha
              showText
              onChange={onColorHandler('color')}
            />
          </div>
          {Object.keys(textAttributesMap).map(key => (
            <div key={key}>
              <Attribute attribute={textAttributesMap[key].text} />
              <Input
                value={`${textAttributesMap[key].value}`}
                type={textAttributesMap[key].type}
                onChange={attributeHandler(key)}
                disabled={textAttributesMap[key].disabled}
              />
            </div>
          ))}
        </>
      )}
      {selected.itemType === ItemType.IMAGE && (
        <>
          <div>
            <Attribute attribute="Image Source" />
            <Input defaultValue={selected.resourceUrl} onPressEnter={onImgSrcHandler} />
          </div>
          <div>
            <Attribute attribute="Link" />
            <Input defaultValue={selected.href} onPressEnter={onItemEntityHandler('href')} />
          </div>
          {Object.keys(imgAttributesMap).map(key => (
            <div key={key}>
              <Attribute attribute={imgAttributesMap[key].text} />
              <Input
                value={`${imgAttributesMap[key].value}`}
                type={imgAttributesMap[key].type}
                onChange={attributeHandler(key)}
                disabled={imgAttributesMap[key].disabled}
              />
            </div>
          ))}
          <div>
            <Attribute attribute="Border Color" />
            <ColorPicker
              defaultValue={`#${selected.attribute.borderColor.toString(16)}`}
              placement="rightBottom"
              disabledAlpha
              showText
              onChange={onColorHandler('borderColor')}
            />
          </div>
          <div>
            <Attribute attribute="Background Color" />
            <ColorPicker
              defaultValue={`#${selected.attribute.backgroundColor.toString(16)}`}
              placement="rightBottom"
              disabledAlpha
              showText
              onChange={onColorHandler('backgroundColor')}
            />
          </div>
          <div>
            <Attribute attribute="Transparent" />
            <Switch value={selected.attribute.transparent} onChange={updateTransparent} />
          </div>
          <div>
            <Attribute attribute="Mirror" />
            <div className="mirror-group">
              <div>
                <span>X:</span>
                <Switch value={selected.materialDirection.x !== 1} onChange={mirror(MIRROR_ACTION.LEFT_RIGHT)} />
              </div>
              <div>
                <span>Y:</span>
                <Switch value={selected.materialDirection.y !== 1} onChange={mirror(MIRROR_ACTION.TOP_BOTTOM)} />
              </div>
            </div>
          </div>
        </>
      )}
      {selected.itemType === ItemType.BUTTON && (
        <>
          <div>
            <Attribute attribute="Text" />
            <Input.TextArea value={selected.text} onChange={onTextHandler} autoSize={{ minRows: 3, maxRows: 5 }} />
          </div>
          <div>
            <Attribute attribute="Link" />
            <Input defaultValue={selected.href} onPressEnter={onItemEntityHandler('href')} />
          </div>
          {Object.keys(imgAttributesMap).map(key => (
            <div key={key}>
              <Attribute attribute={imgAttributesMap[key].text} />
              <Input
                value={`${imgAttributesMap[key].value}`}
                type={imgAttributesMap[key].type}
                onChange={attributeHandler(key)}
                disabled={imgAttributesMap[key].disabled}
              />
            </div>
          ))}
          <div>
            <Attribute attribute="Border Color" />
            <ColorPicker
              defaultValue={`#${selected.attribute.borderColor.toString(16)}`}
              placement="rightBottom"
              disabledAlpha
              showText
              onChange={onColorHandler('borderColor')}
            />
          </div>
          <div>
            <Attribute attribute="Background Color" />
            <ColorPicker
              defaultValue={`#${selected.attribute.backgroundColor.toString(16)}`}
              placement="rightBottom"
              disabledAlpha
              showText
              onChange={onColorHandler('backgroundColor')}
            />
          </div>
          <div>
            <Attribute attribute="Color" />
            <ColorPicker
              defaultValue={`#${selected.attribute.color.toString(16)}`}
              placement="rightBottom"
              disabledAlpha
              showText
              onChange={onColorHandler('color')}
            />
          </div>
          {Object.keys(textAttributesMap)
            .filter(k => !['lineHeight', 'align'].includes(k))
            .map(key => (
              <div key={key}>
                <Attribute attribute={textAttributesMap[key].text} />
                <Input
                  value={`${textAttributesMap[key].value}`}
                  type={textAttributesMap[key].type}
                  onChange={attributeHandler(key)}
                  disabled={textAttributesMap[key].disabled}
                />
              </div>
            ))}
        </>
      )}
    </div>
  );
});
