import { Vec2 } from '@turbox3d/shared';
import { CoordinateController } from './coordinate';
import { HitResult } from './index';
import { CoordinateType } from './type';
import { IGesturesExtra } from './listener/type';

export class SceneEvent<DisplayObject = any> {
  static create<DisplayObject = any>(
    event: PointerEvent | WheelEvent | Touch,
    getCoordinateCtrl: () => CoordinateController,
    hitTargetOriginalByPoint: (point: Vec2) => HitResult<DisplayObject>,
    extra?: IGesturesExtra,
  ) {
    return new SceneEvent<DisplayObject>(event, getCoordinateCtrl, hitTargetOriginalByPoint, extra);
  }

  event: PointerEvent | WheelEvent | Touch;
  getCoordinateCtrl: () => CoordinateController;
  hitTargetOriginalByPoint: (
    point: Vec2,
  ) => HitResult<DisplayObject>;
  gesturesExtra?: IGesturesExtra;

  constructor(
    event: PointerEvent | WheelEvent | Touch,
    getCoordinateCtrl: () => CoordinateController,
    hitTargetOriginalByPoint: (point: Vec2) => HitResult<DisplayObject>,
    extra?: IGesturesExtra,
  ) {
    this.event = event;
    this.getCoordinateCtrl = getCoordinateCtrl;
    this.hitTargetOriginalByPoint = hitTargetOriginalByPoint;
    this.gesturesExtra = extra;
  }

  /**
   * 屏幕坐标
   */
  get screenPosition() {
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
