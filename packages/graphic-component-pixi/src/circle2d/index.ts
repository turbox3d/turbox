import * as PIXI from 'pixi.js';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import DrawUtils from '../draw-utils/index';

interface ICircle2DProps {
  x?: number;
  y?: number;
  radius: number;
  lineWidth?: number;
  lineColor?: number;
  lineAlpha?: number;
  fillColor?: number;
  fillAlpha?: number;
  alpha?: number;
  alignment?: number;
  native?: boolean;
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
      x = 0,
      y = 0,
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
      cx: x,
      cy: y,
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
    //
  }

  updatePosition() {
    //
  }

  updateRotation() {
    //
  }

  updateScale() {
    //
  }
}
