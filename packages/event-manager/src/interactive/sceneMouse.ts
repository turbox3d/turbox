import { getEventClientPos, Vec2 } from '@turbox3d/shared';
import { CoordinateController } from './coordinate';
import { HitResult } from './index';
import { CoordinateType } from './type';

export class SceneMouseEvent<DisplayObject = any> {
  static create<DisplayObject = any>(event: MouseEvent, getCoordinateCtrl: () => CoordinateController, hitTargetOriginalByPoint: (
    point: Vec2,
  ) => HitResult<DisplayObject>) {
    return new SceneMouseEvent<DisplayObject>(event, getCoordinateCtrl, hitTargetOriginalByPoint);
  }

  event: MouseEvent;
  getCoordinateCtrl: () => CoordinateController;
  hitTargetOriginalByPoint: (
    point: Vec2,
  ) => HitResult<DisplayObject>;

  constructor(event: MouseEvent, getCoordinateCtrl: () => CoordinateController, hitTargetOriginalByPoint: (
    point: Vec2,
  ) => HitResult<DisplayObject>) {
    this.event = event;
    this.getCoordinateCtrl = getCoordinateCtrl;
    this.hitTargetOriginalByPoint = hitTargetOriginalByPoint;
  }

  /**
   * 屏幕坐标
   */
  get screenPosition() {
    return getEventClientPos(this.event);
  }

  /**
   * @deprecated 画布坐标
   */
  get layerPosition() {
    return {
      x: this.event.offsetX,
      y: this.event.offsetY,
    };
  }

  /**
   * 画布坐标
   */
  get canvasPosition() {
    return this.getCoordinateCtrl().transform(this.screenPosition, CoordinateType.ScreenToCanvas);
  }

  /**
   * @deprecated 场景世界坐标
   */
  get modelPosition() {
    return this.getCoordinateCtrl().transform(this.screenPosition, CoordinateType.ScreenToScene);
  }

  /**
   * 场景世界坐标
   */
  get scenePosition() {
    return this.getCoordinateCtrl().transform(this.screenPosition, CoordinateType.ScreenToScene);
  }
}
