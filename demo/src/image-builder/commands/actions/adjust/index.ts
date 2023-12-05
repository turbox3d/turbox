/* eslint-disable @typescript-eslint/member-ordering */
import {
  Command,
  ViewEntity,
  SceneEvent,
  SceneTool,
  Action,
  Vec2,
  Vector2,
  EntityObject,
  MathUtils
} from '@turbox3d/turbox';

import { ItemEntity } from '../../../models/entity/item';
import { appCommandManager } from '../../index';

const ACTION_NAME = 'adjustEntity';

export class AdjustCommand extends Command {
  private adjustAction = Action.create(ACTION_NAME);
  private target?: ItemEntity;

  onAdjustStartHandler(v: Partial<ViewEntity>, e: SceneEvent, t: SceneTool) {
    const selected = appCommandManager.defaultCommand.select.getSelectedEntities()[0];
    if (selected instanceof ItemEntity && !selected.locked) {
      this.target = selected;
      this.onRotateStartHandler(v, e, t);
      this.onScaleStartHandler(v, e, t);
    }
  }

  onAdjustMoveHandler(v: Partial<ViewEntity>, e: SceneEvent, t: SceneTool) {
    this.onRotateMoveHandler(v, e, t);
    this.onScaleMoveHandler(v, e, t);
  }

  onAdjustEndHandler(v: Partial<ViewEntity>, e: SceneEvent, t: SceneTool) {
    this.onRotateEndHandler(v, e, t);
    this.onScaleEndHandler(v, e, t);
  }

  private initPosition?: Vector2;
  private degree = 0;

  private onRotateStartHandler(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    if (!this.target) {
      return;
    }
    const ip = event.getScenePosition() as Vec2;
    const type = EntityObject.EPerspectiveType.FRONT;
    this.initPosition = new Vector2(ip.x, ip.y).applyMatrix3(this.target.getConcatenatedMatrix3(type).inverted());
  }

  private onRotateMoveHandler(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    if (!this.target || !this.initPosition) {
      return;
    }
    const mp = event.getScenePosition() as Vec2;
    const type = EntityObject.EPerspectiveType.FRONT;
    const localPoint = new Vector2(mp.x, mp.y).applyMatrix3(this.target.getConcatenatedMatrix3(type).inverted());
    const degree = this.initPosition.clone().angleTo(localPoint) * MathUtils.RAD2DEG;
    this.degree = degree;
    const { snapped } = this.snap(this.target.rotation.z + degree);
    this.adjustAction.execute(
      () => {
        this.target?.setRotation({
          z: this.target.rotation.z + (degree % 360),
        });
        this.target?.$update({
          snapped,
        });
      },
      undefined,
      true,
      { immediately: true }
    );
  }

  private onRotateEndHandler(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    if (!this.target || !this.initPosition) {
      this.adjustAction.abort();
      this.adjustAction = Action.create(ACTION_NAME);
    } else {
      const { rotationZ } = this.snap(this.target.rotation.z + this.degree);
      this.adjustAction.execute(
        () => {
          this.target?.setRotation({
            z: rotationZ,
          });
          this.target?.$update({
            snapped: false,
          });
        },
        undefined,
        true,
        { immediately: true }
      );
      this.adjustAction.complete();
      this.adjustAction = Action.create(ACTION_NAME);
    }
    this.target = undefined;
    this.initPosition = undefined;
    this.degree = 0;
  }

  private snap(degree: number) {
    let rotationZ = degree % 360;
    let snapped = false;
    const baseLine = 90;
    const snapDegree = 15;
    if (Math.abs(rotationZ % baseLine) <= snapDegree) {
      rotationZ = Math.floor(rotationZ / baseLine) * baseLine;
      snapped = true;
    } else if (Math.abs(rotationZ % baseLine) >= baseLine - snapDegree) {
      rotationZ = Math.ceil(rotationZ / baseLine) * baseLine;
      snapped = true;
    }
    return {
      rotationZ,
      snapped,
    };
  }

  private initSize?: Vec2;
  private initLength?: number;

  private onScaleStartHandler(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    if (!this.target) {
      return;
    }
    const mp = event.getScenePosition() as Vec2;
    const type = EntityObject.EPerspectiveType.FRONT;
    const localPoint = new Vector2(mp.x, mp.y).applyMatrix3(this.target.getConcatenatedMatrix3(type).inverted());
    this.initLength = localPoint.length;
    this.initSize = {
      x: this.target.size.x,
      y: this.target.size.y,
    };
  }

  private onScaleMoveHandler(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    const itemEntity = this.target;
    if (!itemEntity) {
      return;
    }
    const mp = event.getScenePosition() as Vec2;
    const type = EntityObject.EPerspectiveType.FRONT;
    const localPoint = new Vector2(mp.x, mp.y).applyMatrix3(itemEntity.getConcatenatedMatrix3(type).inverted());
    if (!this.initLength || !this.initSize) {
      return;
    }
    this.adjustAction.execute(
      () => {
        const scale = localPoint.length / this.initLength!;
        itemEntity.setSize({
          x: this.initSize!.x * scale,
          y: this.initSize!.y * scale,
        });
      },
      undefined,
      true,
      { immediately: true }
    );
  }

  private onScaleEndHandler(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    if (!this.target) {
      this.adjustAction.abort();
      this.adjustAction = Action.create(ACTION_NAME);
    } else {
      this.adjustAction.complete();
      this.adjustAction = Action.create(ACTION_NAME);
    }
    this.target = undefined;
    this.initLength = undefined;
    this.initSize = undefined;
  }
}
