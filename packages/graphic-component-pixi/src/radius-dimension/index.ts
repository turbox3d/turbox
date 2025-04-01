import { Mesh2D } from '@turbox3d/renderer-pixi';
import * as PIXI from 'pixi.js';
import { Vec2 } from '@turbox3d/shared';
import { drawText } from '../_utils/utils';

interface IRadiusDimensionProps {
  center: Vec2;
  angle: number; // 角度
  radius: string; // 半径
  rotation?: number;
  scale?: Vec2;
  /**
   * @description: 标注线起点距离圆心距离
   */
  startP: number; // start point radial direction
  length: number; // length along radial direction
  textSize: number;
}

/**
 * @description: 半径尺寸线
 */
export default class RadiusDimension extends Mesh2D<IRadiusDimensionProps> {
  protected view = new PIXI.Graphics();

  public draw() {
    const graphics = this.view;
    graphics.clear();

    graphics.lineStyle(2, 0x131313);
    graphics.line.native = true;

    const textSize = this.props.textSize;
    const dir = { x: Math.cos(this.props.angle), y: Math.sin(this.props.angle) };

    const startP = { x: this.props.center.x + this.props.startP * dir.x, y: this.props.center.y + this.props.startP * dir.y };
    graphics.moveTo(startP.x, startP.y);
    graphics.lineTo(this.props.center.x + (this.props.startP + this.props.length) * dir.x, this.props.center.y + (this.props.startP + this.props.length) * dir.y);

    // 先沿径向偏移，然后再沿切线方向偏移
    const textOffsetDir = { x: -dir.y, y: dir.x };

    // 径向偏移
    const a = { x: 2 * textSize * dir.x, y: 2 * textSize * dir.y };

    // 切向偏移
    const b = { x: 0.8 * textSize * textOffsetDir.x, y: 0.8 * textSize * textOffsetDir.y };

    drawText(graphics, this.props.radius, { offset: { x: startP.x + a.x + b.x, y: startP.y + a.y + b.y }, size: textSize, rotation: this.props.angle });

    this.view.rotation = this.props.rotation ?? 0;
    this.view.scale.set(this.props.scale?.x ?? 1, this.props.scale?.y ?? 1);
  }
}
