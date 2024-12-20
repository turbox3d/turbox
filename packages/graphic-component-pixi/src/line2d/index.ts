import { Vector2 } from '@turbox3d/math';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import * as PIXI from 'pixi.js';
import DrawUtils from '../draw-utils';

interface IProps {
  lineWidth?: number;
  lineColor?: number;
  alignment?: number;
  start: Vector2;
  end: Vector2;
  zIndex?: number;
}

export default class Line2d extends Mesh2D<IProps> {
  protected view = new PIXI.Graphics();

  draw() {
    const { lineWidth = 2, lineColor = 0xffffff, start, end, alignment = 0.5, zIndex = 0 } = this.props;
    this.view.clear();
    this.view.zIndex = zIndex;
    DrawUtils.drawLine(this.view, {
      x0: start.x,
      y0: start.y,
      x1: end.x,
      y1: end.y,
      lineWidth,
      lineColor,
      alignment,
    });
  }
}
