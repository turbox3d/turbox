import { Vec2 } from '@turbox3d/shared';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import * as PIXI from 'pixi.js';
import DrawUtils from '../draw-utils';

interface ILine2dProps {
  lineWidth?: number;
  lineColor?: number;
  alignment?: number;
  start: Vec2;
  end: Vec2;
  rotation?: number;
  scale?: Vec2;
  zIndex?: number;
}

export default class Line2d extends Mesh2D<ILine2dProps> {
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
    this.view.rotation = this.props.rotation ?? 0;
    this.view.scale.set(this.props.scale?.x ?? 1, this.props.scale?.y ?? 1);
  }
}
