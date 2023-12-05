import * as PIXI from 'pixi.js';

import { Mesh2D, MathUtils, g, Reactive, Rect2d } from '@byted-tx3d/turbox';

import { appCommandManager } from '../../../commands/index';
import { PRIMARY_COLOR } from '../../../common/consts/color';
import { ItemSymbol } from '../../../common/consts/view-entity';
import { Gizmo2d } from '../../../components/Gizmo2d';
import { ItemEntity } from '../../../models/entity/item';

export interface IItemMesh2DProps {
  model: ItemEntity;
}

export class ItemMesh2D extends Mesh2D<IItemMesh2DProps> {
  protected reactivePipeLine = [this.updateMaterial, this.updateRenderOrder, this.updateMaterialDirection];
  protected view = new PIXI.Sprite();

  private updateMaterial() {
    const { model } = this.props;
    if (model.imageData) {
      this.view.texture = PIXI.Texture.from(model.imageData);
      this.view.texture.baseTexture.setSize(model.size.x, model.size.y);
    }
  }

  private updateRenderOrder() {
    const { model } = this.props;
    this.view.zIndex = model.renderOrder;
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
    const isSelected = appCommandManager.defaultCommand.select.getSelectedEntities().includes(model);
    const isHinted = appCommandManager.defaultCommand.hint.getHintedEntity() === model;
    this.view.position.set(model.position.x, model.position.y);
    this.view.rotation = model.rotation.z * MathUtils.DEG2RAD;
    this.view.scale.set(model.scale.x, model.scale.y);
    return [
      g(ItemMesh2D, {
        model,
        id: model.id,
        type: ItemSymbol,
        clickable: true,
        draggable: true,
        hoverable: true,
      }),
      isHinted &&
        g(Rect2d, {
          key: 'wireframe',
          width: model.size.x,
          height: model.size.y,
          central: true,
          lineWidth: 1,
          lineColor: PRIMARY_COLOR,
          fillAlpha: 0,
          alignment: 1,
        }),
      isSelected &&
        g(Gizmo2d, {
          width: model.size.x,
          height: model.size.y,
          deleteHandler: () => {
            appCommandManager.actionsCommand.deleteEntity([model]);
          },
          adjustHandler: (op, v, e, t) => {
            if (op === 'start') {
              appCommandManager.actionsCommand.adjust.onAdjustStartHandler(v, e, t);
            } else if (op === 'move') {
              appCommandManager.actionsCommand.adjust.onAdjustMoveHandler(v, e, t);
            } else {
              appCommandManager.actionsCommand.adjust.onAdjustEndHandler(v, e, t);
            }
          },
        }),
    ];
  }
}
