import { Mesh2D } from '@turbox3d/renderer-pixi';
import * as PIXI from 'pixi.js';
import { drawText } from '../_utils/utils';

interface IXY {
  x: number;
  y: number;
}

interface IAngleDimensionProps {
  center: IXY;
  radius: number;
  startAngle: number;
  endAngle: number;
  anticlockwise: boolean;
}

/**
 * @description: 半径尺寸线
 */
export default class AngleDimension extends Mesh2D<IAngleDimensionProps> {
  protected view = new PIXI.Graphics();

  public draw() {
    const graphics = this.view;
    graphics.clear();

    graphics.lineStyle(1, 0x131313);
    graphics.line.native = true;

    graphics.arc(this.props.center.x, this.props.center.y, this.props.radius, this.props.startAngle, this.props.endAngle, !this.props.anticlockwise);

    // calculate number text
    let k = -1;
    if (this.props.anticlockwise) k *= -1;
    if (this.props.endAngle % (Math.PI * 2) < this.props.startAngle % (Math.PI * 2)) k *= -1;

    let text = Math.abs(this.props.endAngle - this.props.startAngle) % (Math.PI * 2) * 180 / Math.PI;
    if (k < 0) text = 360 - text;

    const bisectorAngle = (this.props.startAngle + this.props.endAngle) / 2;
    const bisectorDir = { x: Math.cos(bisectorAngle), y: Math.sin(bisectorAngle) };
    drawText(graphics, text.toFixed(0), { offset: { x: this.props.center.x + 1.3 * k * this.props.radius * bisectorDir.x, y: this.props.center.y + 1.2 * k * this.props.radius * bisectorDir.y }, size: this.props.radius / 2, rotation: Math.PI / 2 + bisectorAngle });
  }
}
