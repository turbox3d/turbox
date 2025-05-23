import { Mesh2D, MathUtils, g, Reactive, Text2d, Vec2, Image2d, Rect2d } from '@turbox3d/turbox';

import { ItemEntity } from '../../../../models/entity/item';
import { imageBuilderStore } from '../../../../models';
import { ItemType } from '../../../../common/consts/scene';

export interface IItemViewEntityProps {
  model: ItemEntity;
}

@Reactive
export class ItemViewEntity extends Mesh2D<IItemViewEntityProps> {
  private getBounds = (bounds: Vec2) => {
    const isText = this.props.model.itemType === ItemType.TEXT;
    imageBuilderStore.document.pauseRecord();
    const { model } = this.props;
    if (isText) {
      // 文本换行可能会影响高度变化
      model.setSize({
        y: bounds.y,
      });
    }
    model.setTextBounds({
      width: bounds.x,
      height: bounds.y,
    });
    imageBuilderStore.document.resumeRecord();
  };

  render() {
    const { model } = this.props;
    this.view.position.set(model.position.x, model.position.y);
    this.view.rotation = model.rotation.z * MathUtils.DEG2RAD;
    this.view.scale.set(model.scale.x, model.scale.y);
    this.view.zIndex = model.renderOrder;

    return [
      model.itemType === ItemType.TEXT && g(Text2d, {
        text: model.text,
        style: model.getFontStyle(),
        x: model.textBounds.width / 2 - model.size.x / 2,
        y: 0,
        getBounds: this.getBounds,
        central: true,
      }),
      model.itemType === ItemType.IMAGE && g(Image2d, {
        backgroundImage: model.imageData,
        width: model.size.x,
        height: model.size.y,
        lineWidth: model.attribute.borderWidth,
        lineColor: model.attribute.borderColor,
        fillColor: model.attribute.backgroundColor,
        radius: model.attribute.borderRadius,
        x: -(model.size.x / 2),
        y: -(model.size.y / 2),
        materialDirection: model.materialDirection,
        fit: 'fill',
      }),
      model.itemType === ItemType.BUTTON && g(Rect2d, {
        width: model.size.x,
        height: model.size.y,
        lineWidth: model.attribute.borderWidth,
        lineColor: model.attribute.borderColor,
        fillColor: model.attribute.backgroundColor,
        fillAlpha: 1,
        radius: model.attribute.borderRadius,
        x: -(model.size.x / 2),
        y: -(model.size.y / 2),
        children: [
          g(Text2d, {
            text: model.text,
            style: model.getFontStyle(),
            getBounds: this.getBounds,
            central: true,
          }),
        ],
      })
    ];
  }
}
