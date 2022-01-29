import { Mesh2D } from '@turbox3d/graphic-view-pixi';
import * as PIXI from 'pixi.js';
import DrawUtils from '../draw-utils/index';

interface IProps {
  type?: 'front' | 'top' | 'left';
}

/** 坐标轴 2d 控件 */
export default class Axis2d extends Mesh2D<IProps> {
  protected view = new PIXI.Graphics();

  draw() {
    this.view.clear();
    this.view.zIndex = Number.MAX_SAFE_INTEGER;
    const red = 0xff0000; // x轴
    const green = 0x09ff00; // y轴
    const blue = 0x005cfc; // z轴
    let lineColors: number[] = [red, green];
    if (this.props.type === 'front') {
      lineColors = [red, green];
    } else if (this.props.type === 'top') {
      lineColors = [red, blue];
    } else if (this.props.type === 'left') {
      lineColors = [blue, green];
    }
    DrawUtils.drawLine(this.view, {
      x0: 0,
      y0: 0,
      x1: Number.MAX_SAFE_INTEGER,
      y1: 0,
    }, {
      lineWidth: 5,
      lineColor: lineColors[0],
    });
    DrawUtils.drawLine(this.view, {
      x0: 0,
      y0: 0,
      x1: 0,
      y1: Number.MAX_SAFE_INTEGER,
    }, {
      lineWidth: 5,
      lineColor: lineColors[1],
    });
  }
}
