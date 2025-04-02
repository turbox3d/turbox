import {
  Command,
  ViewEntity,
  SceneEvent,
  SceneTool,
  Action,
  Vec2,
  Vector2,
  MathUtils,
  CommandManager,
  HotKey,
  Key,
  HotKeyEventType,
  InferenceEngine,
  InteractiveListener,
} from '@turbox3d/turbox';

import { ITextStyles, ItemEntity } from '../../../models/entity/item';
import { appCommandManager } from '../../index';
import { imageBuilderStore } from '../../../models';
import { ItemType } from '../../../common/consts/scene';

const ADJUST_ACTION_NAME = 'adjustEntity';
const STRETCH_ACTION_NAME = 'stretchEntity';

InteractiveListener.moveTolerance = 0.1;

export class AdjustCommand extends Command {
  private adjustAction = Action.create(ADJUST_ACTION_NAME);
  private stretchAction = Action.create(STRETCH_ACTION_NAME);
  private target?: ItemEntity;
  private inferenceEngine = new InferenceEngine();
  private fixedScale = false;

  constructor(holder: CommandManager) {
    super(holder);
    HotKey.on({
      key: Key.Ctrl,
      handler: (keyEventType: HotKeyEventType) => {
        const selected = appCommandManager.default.select.getSelectedEntities();
        if (selected.length > 0) {
          this.fixedScale = true;
        }
        if (keyEventType === HotKeyEventType.KeyUp) {
          this.fixedScale = false;
        }
      },
    })
  }

  private xStretchStartHandler(v: Partial<ViewEntity>, e: SceneEvent, t: SceneTool) {
    imageBuilderStore.scene.setTextStretching(true);
    const selected = appCommandManager.default.select.getSelectedEntities()[0];
    if (selected instanceof ItemEntity && !selected.locked) {
      this.target = selected;
    }
  }

  private xStretchMoveHandler(v: Partial<ViewEntity>, e: SceneEvent, t: SceneTool) {
    const itemEntity = this.target;
    if (!itemEntity) {
      return;
    }
    const mp = e.getScenePosition() as Vec2;
    const localPoint = new Vector2(mp.x, mp.y).applyMatrix3(itemEntity.getConcatenatedMatrix3().inverted());
    this.stretchAction.execute(
      () => {
        const width = Math.abs(localPoint.x) + itemEntity.size.x / 2;
        if (width > 10) {
          const p = localPoint.x > 0 ? new Vector2(width / 2 - itemEntity.size.x / 2, 0) : new Vector2(-width / 2 + itemEntity.size.x / 2, 0);
          const p1 = p.applyMatrix3(itemEntity.getConcatenatedMatrix3());
          if ((itemEntity.itemType === ItemType.TEXT || itemEntity.itemType === ItemType.BUTTON) && width <= imageBuilderStore.scene.currentTextMinWidth) {
            return;
          }
          itemEntity.setSize({
            x: width,
          });
          itemEntity.setPosition(p1);
          itemEntity.$update({
            attribute: {
              ...itemEntity.attribute,
              wordWrapWidth: width,
            },
          });
        }
      },
      undefined,
      true,
      { immediately: true }
    );
  }

  private xStretchEndHandler(v: Partial<ViewEntity>, e: SceneEvent, t: SceneTool) {
    if (!this.target) {
      this.stretchAction.abort();
      this.stretchAction = Action.create(STRETCH_ACTION_NAME);
    } else {
      this.stretchAction.complete();
      this.stretchAction = Action.create(STRETCH_ACTION_NAME);
    }
    this.target = undefined;
    imageBuilderStore.scene.setTextStretching(false);
  }

  private initPosition?: Vector2;
  private degree = 0;

  private onRotateStartHandler(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    if (!this.target) {
      return;
    }
    const ip = event.getScenePosition() as Vec2;
    this.initPosition = new Vector2(ip.x, ip.y).applyMatrix3(this.target.getConcatenatedMatrix3().inverted());
  }

  private onRotateMoveHandler(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    if (!this.target || !this.initPosition) {
      return;
    }
    const mp = event.getScenePosition() as Vec2;
    const localPoint = new Vector2(mp.x, mp.y).applyMatrix3(this.target.getConcatenatedMatrix3().inverted());
    const degree = this.initPosition.clone().angleTo(localPoint) * MathUtils.RAD2DEG;
    this.degree = degree;
    const { snapped } = this.inferenceEngine.rotateSnap2d(this.target.rotation.z + degree);
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
      this.adjustAction = Action.create(ADJUST_ACTION_NAME);
    } else {
      const { snappedDegree } = this.inferenceEngine.rotateSnap2d(this.target.rotation.z + this.degree);
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
      this.adjustAction = Action.create(ADJUST_ACTION_NAME);
    }
    this.target = undefined;
    this.initPosition = undefined;
    this.degree = 0;
  }

  private initSize?: Vec2;
  private initLength?: number;
  private initAttribute?: ITextStyles & Record<string, any>;
  private initItemPosition?: Vec2;

  private onScaleStartHandler(viewEntity: Partial<ViewEntity>, event: SceneEvent, tools: SceneTool) {
    if (!this.target) {
      return;
    }
    const mp = event.getScenePosition() as Vec2;
    const localPoint = new Vector2(mp.x, mp.y).applyMatrix3(this.target.getConcatenatedMatrix3().inverted());
    this.initLength = localPoint.length;
    this.initSize = {
      x: this.target.size.x,
      y: this.target.size.y,
    };
    this.initAttribute = this.target.attribute;
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
    const localPoint = new Vector2(mp.x, mp.y).applyMatrix3(itemEntity.getConcatenatedMatrix3().inverted());
    if (!this.initLength || !this.initSize || !this.initAttribute || !this.initItemPosition) {
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
            const fontSize = this.initAttribute?.fontSize! / 2 * scale + this.initAttribute?.fontSize! / 2;
            itemEntity.$update({
              attribute: {
                ...itemEntity.attribute,
                fontSize,
              },
            });
          }
        } else {
          const scale = localPoint.length / this.initLength!;
          itemEntity.setSize({
            x: this.initSize!.x * scale,
            y: this.initSize!.y * scale,
          });
          const fontSize = this.initAttribute?.fontSize! * scale;
          itemEntity.$update({
            attribute: {
              ...itemEntity.attribute,
              fontSize,
            },
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
      this.adjustAction = Action.create(ADJUST_ACTION_NAME);
    } else {
      this.adjustAction.complete();
      this.adjustAction = Action.create(ADJUST_ACTION_NAME);
    }
    this.target = undefined;
    this.initLength = undefined;
    this.initSize = undefined;
    this.initAttribute = undefined;
    this.initItemPosition = undefined;
  }

  adjustHandler(op: 'start' | 'move' | 'end', v: Partial<ViewEntity>, e: SceneEvent, t: SceneTool) {
    const actionsMap = {
      start: () => {
        const selected = appCommandManager.default.select.getSelectedEntities()[0];
        if (selected instanceof ItemEntity && !selected.locked) {
          this.target = selected;
          if (!this.fixedScale) {
            this.onRotateStartHandler(v, e, t);
          }
          this.onScaleStartHandler(v, e, t);
        }
      },
      move: () => {
        if (!this.fixedScale) {
          this.onRotateMoveHandler(v, e, t);
        }
        this.onScaleMoveHandler(v, e, t);
      },
      end: () => {
        if (!this.fixedScale) {
          this.onRotateEndHandler(v, e, t);
        }
        this.onScaleEndHandler(v, e, t);
      },
    };
    actionsMap[op]();
  }

  xStretchHandler(op:'start' |'move' | 'end', v: Partial<ViewEntity>, e: SceneEvent, t: SceneTool) {
    const actionsMap = {
      start: () => {
        this.xStretchStartHandler(v, e, t);
      },
      move: () => {
        this.xStretchMoveHandler(v, e, t);
      },
      end: () => {
        this.xStretchEndHandler(v, e, t);
      },
    };
    actionsMap[op]();
  }
}
