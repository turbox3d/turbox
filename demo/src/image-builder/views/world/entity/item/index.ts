import { Mesh2D, MathUtils, g, Reactive, Text2d, Vec2, Image2d, Rect2d, Component } from '@turbox3d/turbox';

import { ItemEntity } from '../../../../models/entity/item';
import { imageBuilderStore } from '../../../../models';
import { ItemType } from '../../../../common/consts/scene';

export interface IItemViewEntityProps {
  model: ItemEntity;
}

@Reactive
class ButtonText extends Component<IItemViewEntityProps> {
  private getBounds = (bounds: Vec2) => {
    imageBuilderStore.document.pauseRecord();
    const { model } = this.props;
    model.setTextBounds({
      width: bounds.x,
      height: bounds.y,
    });
    imageBuilderStore.document.resumeRecord();
  };

  render() {
    const { model } = this.props;
    return [
      g(Text2d, {
        text: model.text,
        style: model.fontStyles,
        getBounds: this.getBounds,
        central: true,
      }),
    ];
  }
}

@Reactive
export class ItemViewEntity extends Mesh2D<IItemViewEntityProps> {
  private getBounds = (bounds: Vec2) => {
    imageBuilderStore.document.pauseRecord();
    const { model } = this.props;
    model.setSize({
      y: bounds.y,
    });
    model.setTextBounds({
      width: bounds.x,
      height: bounds.y,
    });
    imageBuilderStore.document.resumeRecord();
  };

  private buttonChildren = [g(ButtonText, { model: this.props.model })];

  render() {
    const { model } = this.props;
    this.view.position.set(model.position.x, model.position.y);
    this.view.rotation = model.rotation.z * MathUtils.DEG2RAD;
    this.view.scale.set(model.scale.x, model.scale.y);
    this.view.zIndex = model.renderOrder;

    return [
      model.itemType === ItemType.TEXT &&
        g(Text2d, {
          text: model.text,
          style: model.fontStyles,
          x: model.textBounds.width / 2 - model.size.x / 2,
          y: 0,
          getBounds: this.getBounds,
          central: true,
        }),
      model.itemType === ItemType.IMAGE &&
        g(Image2d, {
          backgroundImage: model.imageData,
          width: model.size.x,
          height: model.size.y,
          lineWidth: model.attribute.borderWidth,
          lineColor: model.attribute.borderColor,
          fillColor: model.attribute.backgroundColor,
          fillAlpha: model.attribute.transparent ? 0 : 1,
          radius: model.attribute.borderRadius,
          x: -(model.size.x / 2),
          y: -(model.size.y / 2),
          materialDirection: model.materialDirection,
          fit: 'fill',
        }),
      model.itemType === ItemType.BUTTON &&
        g(Rect2d, {
          width: model.size.x,
          height: model.size.y,
          lineWidth: model.attribute.borderWidth,
          lineColor: model.attribute.borderColor,
          fillColor: model.attribute.backgroundColor,
          fillAlpha: 1,
          radius: model.attribute.borderRadius,
          x: -(model.size.x / 2),
          y: -(model.size.y / 2),
          children: this.buttonChildren,
        }),
    ];
  }
}
