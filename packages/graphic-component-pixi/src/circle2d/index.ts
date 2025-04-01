import * as PIXI from 'pixi.js';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import { Vec2 } from '@turbox3d/shared';
import DrawUtils from '../draw-utils/index';

interface ICircle2DProps {
  center: Vec2;
  radius: number;
  rotation?: number;
  scale?: Vec2;
  lineWidth?: number;
  lineColor?: number;
  lineAlpha?: number;
  fillColor?: number;
  fillAlpha?: number;
  alpha?: number;
  alignment?: number;
  native?: boolean;
  zIndex?: number;
}

/** 正方形 */
export default class Circle2d extends Mesh2D<ICircle2DProps> {
  protected view = new PIXI.Graphics();
  protected reactivePipeLine = [
    this.updateGeometry,
    this.updateMaterial,
    this.updatePosition,
    this.updateRotation,
    this.updateScale,
  ];

  updateGeometry() {
    this.view.clear();
    const {
      radius,
      lineWidth,
      lineColor,
      lineAlpha,
      fillColor,
      fillAlpha,
      alpha,
      alignment,
      native,
    } = this.props;
    DrawUtils.drawCircle(this.view, {
      cx: 0,
      cy: 0,
      radius,
      lineWidth,
      lineColor,
      lineAlpha,
      fillColor,
      fillAlpha,
      alpha,
      alignment,
      native,
    });
  }

  updateMaterial() {
    const { zIndex = 0 } = this.props;
    this.view.zIndex = zIndex;
  }

  updatePosition() {
    const { center } = this.props;
    this.view.position.set(center.x, center.y);
  }

  updateRotation() {
    this.view.rotation = this.props.rotation ?? 0;
  }

  updateScale() {
    const { scale = { x: 1, y: 1 } } = this.props;
    this.view.scale.set(scale.x, scale.y);
  }
}
