import { getEventClientPos } from '@turbox3d/shared';
import { ITransformPos } from './type';

export class SceneMouseEvent {
  static create(event: MouseEvent, transform: ITransformPos) {
    return new SceneMouseEvent(event, transform);
  }

  // eslint-disable-next-line no-useless-constructor
  constructor(protected event: MouseEvent, private transform: ITransformPos) { }

  /**
   * 屏幕坐标
   */
  get screenPosition() {
    return getEventClientPos(this.event);
  }

  /**
   * 画布坐标
   */
  get layerPosition() {
    return {
      x: this.event.offsetX,
      y: this.event.offsetY,
    };
  }

  /**
   * 真实世界坐标
   */
  get modelPosition() {
    return this.transform(this.layerPosition);
  }
}
