/* eslint-disable @typescript-eslint/member-ordering */
import { Vec2, Vec3 } from '@turbox3d/shared';
import { CoordinateType } from './type';

interface ICanvasRect {
  width: number;
  height: number;
  x: number;
  y: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
}

export abstract class CoordinateController {
  /**
   * 将坐标进行转化
   */
  transform(point: Vec2 | Vec3, type: CoordinateType, z?: number): Vec2 | Vec3 {
    switch (type) {
    case CoordinateType.ScreenToCanvas:
      return this.screenToCanvas(point);
    case CoordinateType.ScreenToScene:
      return this.screenToScene(point, z);
    case CoordinateType.CanvasToScreen:
      return this.canvasToScreen(point);
    case CoordinateType.CanvasToScene:
      return this.canvasToScene(point, z);
    case CoordinateType.SceneToScreen:
      return this.sceneToScreen(point);
    case CoordinateType.SceneToCanvas:
      return this.sceneToCanvas(point);
    default:
      return point;
    }
  }

  private screenToCanvas(point: Vec2) {
    const { x, y } = this.getCanvasRectImpl();
    return {
      x: point.x - x,
      y: point.y - y,
    };
  }

  private canvasToScreen(point: Vec2) {
    const { x, y } = this.getCanvasRectImpl();
    return {
      x: point.x + x,
      y: point.y + y,
    };
  }

  private canvasToScene(point: Vec2, z?: number) {
    return this.canvasToSceneImpl(point, z);
  }

  private sceneToCanvas(point: Vec2 | Vec3) {
    return this.sceneToCanvasImpl(point);
  }

  /** 获取画布矩形包围盒的实现 */
  abstract getCanvasRectImpl(): ICanvasRect;

  /** 画布屏幕坐标转场景世界坐标的实现 */
  abstract canvasToSceneImpl(point: Vec2, z?: number): Vec2 | Vec3;

  /** 场景世界坐标转画布屏幕坐标的实现 */
  abstract sceneToCanvasImpl(point: Vec2 | Vec3): Vec2;

  private screenToScene(point: Vec2, z?: number) {
    return this.canvasToScene(this.screenToCanvas(point), z);
  }

  private sceneToScreen(point: Vec2 | Vec3) {
    return this.canvasToScreen(this.sceneToCanvas(point));
  }
}
