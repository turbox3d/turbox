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
  MathUtils,
  CommandManager,
  HotKey,
  Key,
  HotKeyEventType,
  InferenceEngine
} from '@turbox3d/turbox';

import { ItemEntity } from '../../../models/entity/item';
import { appCommandManager } from '../../index';

const ACTION_NAME = 'adjustEntity';

export class AdjustCommand extends Command {
  private adjustAction = Action.create(ACTION_NAME);
  private target?: ItemEntity;
  private inferenceEngine = new InferenceEngine();
  private fixedScale = false;

  constructor(holder: CommandManager) {
    super(holder);
    HotKey.on({
      key: Key.Ctrl,
      handler: (keyEventType: HotKeyEventType) => {
        const selected = appCommandManager.defaultCommand.select.getSelectedEntities();
        if (selected.length > 0) {
          this.fixedScale = true;
        }
        if (keyEventType === HotKeyEventType.KeyUp) {
          this.fixedScale = false;
        }
      },
    })
  }

  onAdjustStartHandler(v: Partial<ViewEntity>, e: SceneEvent, t: SceneTool) {
    const selected = appCommandManager.defaultCommand.select.getSelectedEntities()[0];
    if (selected instanceof ItemEntity && !selected.locked) {
      this.target = selected;
      if (!this.fixedScale) {
        this.onRotateStartHandler(v, e, t);
      }
      this.onScaleStartHandler(v, e, t);
    }
  }

  onAdjustMoveHandler(v: Partial<ViewEntity>, e: SceneEvent, t: SceneTool) {
    if (!this.fixedScale) {
      this.onRotateMoveHandler(v, e, t);
    }
    this.onScaleMoveHandler(v, e, t);
  }

  onAdjustEndHandler(v: Partial<ViewEntity>, e: SceneEvent, t: SceneTool) {
    if (!this.fixedScale) {
      this.onRotateEndHandler(v, e, t);
    }
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
    const { snapped } = this.inferenceEngine.rotateSnap(this.target.rotation.z + degree);
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
      const { snappedDegree } = this.inferenceEngine.rotateSnap(this.target.rotation.z + this.degree);
      this.adjustAction.execute(
        () => {
          this.target?.setRotation({
            z: snappedDegree,
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

  private initSize?: Vec2;
  private initLength?: number;
  private initFontSize?: number;
  private initItemPosition?: Vec2;

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
    this.initFontSize = this.target.fontSize;
    this.initItemPosition = {
      x: this.target.position.x,
      y: this.target.position.y,
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
    if (!this.initLength || !this.initSize || !this.initFontSize || !this.initItemPosition) {
      return;
    }
    this.adjustAction.execute(
      () => {
        if (this.fixedScale) {
          const sub = new Vector2(mp.x, mp.y).subtracted(new Vector2(this.initItemPosition!.x, this.initItemPosition!.y));
          const scale = (sub.length / this.initLength!) * (sub.x >= 0 ? 1 : -1);
          if (scale > -1) {
            itemEntity.setPosition({
              x: this.initItemPosition!.x + (this.initSize!.x / 2 * scale + this.initSize!.x / 2) / 2 - this.initSize!.x / 2,
              y: this.initItemPosition!.y + (this.initSize!.y / 2 * scale + this.initSize!.y / 2) / 2 - this.initSize!.y / 2,
            });
            itemEntity.setSize({
              x: this.initSize!.x / 2 * scale + this.initSize!.x / 2,
              y: this.initSize!.y / 2 * scale + this.initSize!.y / 2,
            });
            itemEntity.$update({
              fontSize: this.initFontSize! / 2 * scale + this.initFontSize! / 2,
            });
          }
        } else {
          const scale = localPoint.length / this.initLength!;
          itemEntity.setSize({
            x: this.initSize!.x * scale,
            y: this.initSize!.y * scale,
          });
          itemEntity.$update({
            fontSize: this.initFontSize! * scale,
          });
        }
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
    this.initFontSize = undefined;
    this.initItemPosition = undefined;
  }
}
