import * as PIXI from 'pixi.js';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import DrawUtils from '../draw-utils/index';

interface IProps {
  /** The X of the bottom-left of the rectangle */
  x?: number;
  /** The Y of the bottom-left of the rectangle */
  y?: number;
  width: number;
  height: number;
  /**
   * 传入的位置坐标是否是矩形中心点
   */
  central?: boolean;
  lineWidth?: number;
  lineColor?: number;
  lineAlpha?: number;
  fillColor?: number;
  fillAlpha?: number;
  alpha?: number;
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
      lineWidth,
      lineColor,
      lineAlpha,
      fillColor,
      fillAlpha,
      alpha,
    } = this.props;
    DrawUtils.drawRect(this.view, {
      x,
      y,
      width,
      height,
      central,
    }, {
      lineWidth,
      lineColor,
      lineAlpha,
      fillColor,
      fillAlpha,
      alpha,
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
