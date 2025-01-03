import * as PIXI from 'pixi.js';

import { Mesh2D, MathUtils, g, Reactive, Text2d, Vec2 } from '@turbox3d/turbox';

import { ItemSymbol } from '../../../common/consts/view-entity';
import { ItemEntity } from '../../../models/entity/item';
import { imageBuilderStore } from '../../../models';
import { appCommandManager } from '../../../commands';

export interface IItemMesh2DProps {
  model: ItemEntity;
}

export class ItemMesh2D extends Mesh2D<IItemMesh2DProps> {
  protected reactivePipeLine = [this.updateMaterial, this.updateMaterialDirection];
  protected view = new PIXI.Sprite();

  private updateMaterial() {
    const { model } = this.props;
    if (model.imageData) {
      this.view.texture = PIXI.Texture.from(model.imageData);
      this.view.texture.baseTexture.setSize(model.size.x, model.size.y);
    }
  }

  private updateMaterialDirection() {
    const { model } = this.props;
    this.view.anchor.set(0.5, 0.5);
    this.view.scale.set(model.materialDirection.x, model.materialDirection.y);
  }
}

export interface IItemViewEntityProps {
  model: ItemEntity;
}

@Reactive
export class ItemViewEntity extends Mesh2D<IItemViewEntityProps> {
  private getMaxWidthWord = () => {
    const { model } = this.props;
    const style = new PIXI.TextStyle({
      fontSize: model.attribute.fontSize,
      lineHeight: model.attribute.lineHeight,
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
    imageBuilderStore.document.pauseRecord();
    const { model } = this.props;
    const isTextStretching = imageBuilderStore.scene.isTextStretching;
    if (isTextStretching) {
      model.setSize({
        y: bounds.y,
      });
      const width = this.getMaxWidthWord();
      imageBuilderStore.scene.setCurrentTextMinWidth(width);
    } else {
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

    const item = model.text ? g(Text2d, {
      text: model.text,
      style: new PIXI.TextStyle({
        fontSize: model.attribute.fontSize,
        lineHeight: model.attribute.lineHeight,
        fontFamily: model.attribute.fontFamily,
        fill: model.attribute.color,
        fontWeight: model.attribute.fontWeight,
        align: model.attribute.align,
        wordWrap: model.attribute.wordWrap,
        wordWrapWidth: model.attribute.wordWrapWidth,
      }),
      position: {
        x: -(model.size.x / 2 - imageBuilderStore.scene.textBounds.width / 2),
        y: 0,
      },
      zIndex: model.renderOrder,
      id: model.id,
      type: ItemSymbol,
      getBounds: this.getBounds,
      central: true,
      clickable: true,
      draggable: true,
      hoverable: true,
    }) : g(ItemMesh2D, {
      model,
      id: model.id,
      type: ItemSymbol,
      clickable: true,
      draggable: true,
      hoverable: true,
    });
    return [
      item,
    ];
  }
}
