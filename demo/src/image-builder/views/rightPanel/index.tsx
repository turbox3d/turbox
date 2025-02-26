import * as React from 'react';
import { ReactiveReact } from '@turbox3d/turbox';
import { ColorPicker, Input } from 'antd';
import './index.less';
import { appCommandManager } from '../../commands';
import { ItemEntity } from '../../models/entity/item';
import { ItemType } from '../../common/consts/scene';
import { Color } from 'antd/es/color-picker';

export const RightPanel = ReactiveReact(() => {
  const selected = appCommandManager.default.select.getSelectedEntities()[0];
  if (!selected || !(selected instanceof ItemEntity)) {
    return null;
  }

  const attributesMap = {
    fontFamily: { text: '字体', value: selected.attribute.fontFamily },
    fontSize: { text: '字号', value: selected.attribute.fontSize, disabled: true },
    align: { text: '对齐', value: selected.attribute.align },
    fontWeight: { text: '粗细', value: selected.attribute.fontWeight },
    lineHeight: { text: '行高(倍数)', value: selected.attribute.lineHeight },
    fontStyle: { text: '斜体', value: selected.attribute.fontStyle },
  };

  const onTextHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    appCommandManager._shared.updateText(e.target.value);
  };
  const onLinkHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    selected.$update({
      href: e.target.value,
    });
  };
  const onColorHandler = (e: Color) => {
    selected.$update({
      attribute: {
        ...selected.attribute,
        color: Number(e.toHexString().replace('#', '0x')),
      },
    });
  };
  const attributeHandler = (key: string) => (e) => {
    selected.$update({
      attribute: {
        ...selected.attribute,
       [key]: key !== 'color' ? e.target.value : e.toHexString(),
      },
    });
  };

  return (
    <div className="right-panel">
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
            <div>链接</div>
            <Input
              value={selected.href}
              onChange={onLinkHandler}
            />
          </div>
          <div>
            <div>颜色</div>
            <ColorPicker defaultValue={`#${selected.attribute.color.toString(16)}`} placement="rightBottom" disabledAlpha showText onChange={onColorHandler} />
          </div>
          {Object.keys(attributesMap).map(key => (
            <div key={key}>
              <div>{attributesMap[key].text}</div>
              <Input value={`${attributesMap[key].value}`} onChange={attributeHandler(key)} disabled={attributesMap[key].disabled} />
            </div>
          ))}
        </>
      )}
      {selected.itemType === ItemType.IMAGE && (
        <>
          <div>
            <div>图片地址</div>
            <Input
              value={selected.href}
              onChange={onLinkHandler}
            />
          </div>
          <div>
            <div>链接</div>
            <Input
              value={selected.href}
              onChange={onLinkHandler}
            />
          </div>
          <div>
            <div>宽度</div>
            <Input
              value={selected.size.x}
              disabled
            />
          </div>
          <div>
            <div>高度</div>
            <Input
              value={selected.size.y}
              disabled
            />
          </div>
        </>
      )}
    </div>
  );
});
