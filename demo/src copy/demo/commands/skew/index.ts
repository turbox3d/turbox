/* eslint-disable @typescript-eslint/member-ordering */
import { Command, ViewEntity, SceneEvent, EntityObject, Vec3, Vector3, SceneTool } from '@byted-tx3d/turbox';

import { SkewPointSymbol } from '../../common/consts/scene';
import { ProductEntity } from '../../models/entity/product';
import { SkewPointEntity } from '../../models/entity/skewPoint';
import { ldeStore } from '../../models/index';

export class SkewCommand extends Command {
  private target?: SkewPointEntity;
  private initPosition?: Vector3;
  private initModelPosition?: Vector3;

  protected onDragStart(viewEntity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    ldeStore.actions.skewAction.execute(
      () => {
        if (viewEntity.type === SkewPointSymbol) {
          this.target = EntityObject.getEntityById(viewEntity.id) as SkewPointEntity;
        }
        if (this.target) {
          const mp = event.getScenePosition(this.target.position.z) as Vec3;
          this.initPosition = new Vector3(mp.x, mp.y, mp.z);
          const model = EntityObject.getEntityById(viewEntity.id)?.parent as ProductEntity;
          const v = this.initPosition.clone().applyMatrix4(model.getMatrix4().inverted());
          this.initPosition = v;
          const position = this.target.position.toArray();
          this.initModelPosition = new Vector3(...position);
        }
      },
      undefined,
      true,
      { immediately: true }
    );
  }

  protected onDragMove(viewEntity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    if (!this.initPosition || !this.target) {
      return;
    }
    const sp = event.getScenePosition(this.target.position.z) as Vec3;
    const model = EntityObject.getEntityById(viewEntity.id)?.parent as ProductEntity;
    const currentPosition = new Vector3(sp.x, sp.y, sp.z).applyMatrix4(model.getMatrix4().inverted());
    ldeStore.actions.skewAction.execute(
      () => {
        const offset = this.initPosition!.subtracted(this.initModelPosition!);
        const position = currentPosition.subtracted(offset);
        const v = this.target!.position.toArray();
        this.target!.setPosition({
          x: position.x,
          y: position.y,
        });
      },
      undefined,
      true,
      { immediately: true }
    );
  }

  protected onDragEnd() {
    this.initPosition = undefined;
    this.initModelPosition = undefined;
    this.target = undefined;
  }
}
