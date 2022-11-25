import { Vec2 } from '@turbox3d/shared';
import { CoordinateController } from './coordinate';
import { HitResult } from './index';
import { CoordinateType } from './type';
import { GesturesExtra, Extra } from './listener/type';

export class SceneEvent<DisplayObject = any> {
  static create<DisplayObject = any>(
    event: PointerEvent | WheelEvent | Touch,
    getCoordinateCtrl: () => CoordinateController,
    hitTargetOriginalByPoint: (point: Vec2) => HitResult<DisplayObject>,
    extra?: GesturesExtra | Extra,
  ) {
    return new SceneEvent<DisplayObject>(event, getCoordinateCtrl, hitTargetOriginalByPoint, extra);
  }

  event: PointerEvent | WheelEvent | Touch;
  getCoordinateCtrl: () => CoordinateController;
  hitTargetOriginalByPoint: (point: Vec2) => HitResult<DisplayObject>;
  extra?: GesturesExtra | Extra;

  constructor(
    event: PointerEvent | WheelEvent | Touch,
    getCoordinateCtrl: () => CoordinateController,
    hitTargetOriginalByPoint: (point: Vec2) => HitResult<DisplayObject>,
    extra?: GesturesExtra | Extra,
  ) {
    this.event = event;
    this.getCoordinateCtrl = getCoordinateCtrl;
    this.hitTargetOriginalByPoint = hitTargetOriginalByPoint;
    this.extra = extra;
  }

  /**
   * 屏幕坐标
   */
  get screenPosition() {
    const extra = this.extra as Extra | undefined;
    if (extra && extra.mouseDownInfo) {
      return {
        x: extra.mouseDownInfo.x,
        y: extra.mouseDownInfo.y,
      };
    }
    return {
      x: this.event.clientX,
      y: this.event.clientY,
    };
  }

  /**
   * 画布坐标
   */
  get canvasPosition() {
    return this.getCoordinateCtrl().transform(this.screenPosition, CoordinateType.ScreenToCanvas);
  }

  /**
   * 场景世界坐标
   */
  getScenePosition(z?: number) {
    return this.getCoordinateCtrl().transform(this.screenPosition, CoordinateType.ScreenToScene, z);
  }
}
