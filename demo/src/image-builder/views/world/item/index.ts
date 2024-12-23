import * as PIXI from 'pixi.js';

import { Mesh2D, MathUtils, g, Reactive, Text2d } from '@turbox3d/turbox';

import { ItemSymbol } from '../../../common/consts/view-entity';
import { ItemEntity } from '../../../models/entity/item';

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
  render() {
    const { model } = this.props;
    this.view.position.set(model.position.x, model.position.y);
    this.view.rotation = model.rotation.z * MathUtils.DEG2RAD;
    this.view.scale.set(model.scale.x, model.scale.y);
    this.view.zIndex = model.renderOrder;

    const item = model.text ? g(Text2d, {
      text: model.text,
      style: new PIXI.TextStyle({
        fontSize: model.fontSize,
        fontFamily: 'Arial',
      }),
      zIndex: model.renderOrder,
      id: model.id,
      type: ItemSymbol,
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
