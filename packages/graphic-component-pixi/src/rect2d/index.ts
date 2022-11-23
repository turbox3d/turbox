import * as PIXI from 'pixi.js';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import DrawUtils from '../draw-utils/index';
import { IFitStyle } from '../draw-utils/drawRect';

interface IProps {
  x?: number;
  y?: number;
  width: number;
  height: number;
  /**
   * 传入的位置坐标是否是矩形中心点
   */
  central?: boolean;
  radius?: number;
  lineWidth?: number;
  lineColor?: number;
  lineAlpha?: number;
  fillColor?: number;
  fillAlpha?: number;
  alpha?: number;
  backgroundImage?: string;
  fit?: IFitStyle;
  zIndex?: number;
  alignment?: number;
  native?: boolean;
}

/** 正方形 */
export default class Rect2d extends Mesh2D<IProps> {
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
      width,
      height,
      central,
      radius,
      lineWidth,
      lineColor,
      lineAlpha,
      fillColor,
      fillAlpha,
      alpha,
      backgroundImage,
      fit,
      alignment,
      native,
    } = this.props;
    DrawUtils.drawRect(this.view, {
      x,
      y,
      width,
      height,
      central,
      radius,
      lineWidth,
      lineColor,
      lineAlpha,
      fillColor,
      fillAlpha,
      alpha,
      backgroundImage,
      fit,
      alignment,
      native,
    });
  }

  updateMaterial() {
    const { zIndex = 0 } = this.props;
    this.view.zIndex = zIndex;
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
