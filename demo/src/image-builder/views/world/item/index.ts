import * as PIXI from 'pixi.js';

import { Mesh2D, MathUtils, g, Reactive, Text2d, Vec2, Image2d } from '@turbox3d/turbox';

import { ItemSymbol } from '../../../common/consts/view-entity';
import { ItemEntity } from '../../../models/entity/item';
import { imageBuilderStore } from '../../../models';
import { ItemType } from '../../../common/consts/scene';

export interface IItemViewEntityProps {
  model: ItemEntity;
}

@Reactive
export class ItemViewEntity extends Mesh2D<IItemViewEntityProps> {
  private getMaxWidthWord = () => {
    const { model } = this.props;
    const style = new PIXI.TextStyle({
      fontSize: model.attribute.fontSize,
      lineHeight: model.attribute.lineHeight * model.attribute.fontSize,
      fontFamily: model.attribute.fontFamily,
      fill: model.attribute.color,
      fontWeight: model.attribute.fontWeight,
      align: model.attribute.align,
    });
    const words = model.text.trim().split(/\s+/);
    const maxWidthWord = words.reduce((prev, cur) => {
      const prevWidth = new PIXI.Text(prev, style).width;
      const curWidth = new PIXI.Text(cur, style).width;
      if (prevWidth > curWidth) {
        return prev;
      }
      return cur;
    });
    const width = new PIXI.Text(maxWidthWord, style).width;
    return width;
  }

  private getBounds = (bounds: Vec2) => {
    const isText = this.props.model.itemType === ItemType.TEXT;
    imageBuilderStore.document.pauseRecord();
    const { model } = this.props;
    const isTextStretching = imageBuilderStore.scene.isTextStretching;
    if (isTextStretching) {
      let wrapWidth = bounds.x;
      if (isText) {
        model.setSize({
          y: bounds.y,
        });
        wrapWidth = this.getMaxWidthWord();
      }
      imageBuilderStore.scene.setCurrentTextMinWidth(wrapWidth);
    } else if (isText) {
      model.setSize({
        x: bounds.x,
        y: bounds.y,
      });
    }
    imageBuilderStore.scene.setTextBounds({
      width: bounds.x,
      height: bounds.y,
    });
    imageBuilderStore.document.resumeRecord();
  }

  render() {
    const { model } = this.props;
    this.view.position.set(model.position.x, model.position.y);
    this.view.rotation = model.rotation.z * MathUtils.DEG2RAD;
    this.view.scale.set(model.scale.x, model.scale.y);
    this.view.zIndex = model.renderOrder;

    return [
      model.itemType === ItemType.TEXT && g(Text2d, {
        text: model.text,
        style: new PIXI.TextStyle({
          fontSize: model.attribute.fontSize,
          lineHeight: model.attribute.lineHeight * model.attribute.fontSize,
          fontFamily: model.attribute.fontFamily,
          fill: model.attribute.color,
          fontWeight: model.attribute.fontWeight,
          align: model.attribute.align,
          wordWrap: model.attribute.wordWrap,
          wordWrapWidth: model.attribute.wordWrapWidth,
          fontStyle: model.attribute.fontStyle,
        }),
        x: imageBuilderStore.scene.textBounds.width / 2 - model.size.x / 2,
        y: 0,
        id: model.id,
        type: ItemSymbol,
        getBounds: this.getBounds,
        central: true,
        clickable: true,
        draggable: true,
        hoverable: true,
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
        id: model.id,
        type: ItemSymbol,
        clickable: true,
        draggable: true,
        hoverable: true,
      }),
      model.itemType === ItemType.BUTTON && g(Image2d, {
        width: model.size.x,
        height: model.size.y,
        lineWidth: model.attribute.borderWidth,
        lineColor: model.attribute.borderColor,
        fillColor: model.attribute.backgroundColor,
        fillAlpha: 1,
        radius: model.attribute.borderRadius,
        x: -(model.size.x / 2),
        y: -(model.size.y / 2),
        id: model.id,
        type: ItemSymbol,
        clickable: true,
        draggable: true,
        hoverable: true,
        children: [
          g(Text2d, {
            text: model.text,
            style: new PIXI.TextStyle({
              fontSize: model.attribute.fontSize,
              lineHeight: model.attribute.lineHeight * model.attribute.fontSize,
              fontFamily: model.attribute.fontFamily,
              fill: model.attribute.color,
              fontWeight: model.attribute.fontWeight,
              align: model.attribute.align,
              wordWrap: model.attribute.wordWrap,
              wordWrapWidth: model.attribute.wordWrapWidth,
              fontStyle: model.attribute.fontStyle,
            }),
            x: model.size.x / 2,
            y: model.size.y / 2,
            id: model.id,
            type: ItemSymbol,
            getBounds: this.getBounds,
            central: true,
            clickable: true,
            draggable: true,
            hoverable: true,
          }),
        ],
      })
    ];
  }
}
