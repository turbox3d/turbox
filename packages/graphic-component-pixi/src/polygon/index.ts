import { Mesh2D } from '@turbox3d/renderer-pixi';
import { Vec2 } from '@turbox3d/shared';
import * as PIXI from 'pixi.js';
import DrawUtils from '../draw-utils/index';

interface IPolygonProps {
  path: Vec2[];
  rotation?: number;
  scale?: Vec2;
  lineWidth?: number;
  lineColor?: number;
  lineAlpha?: number;
  fillColor?: number;
  fillAlpha?: number;
  alpha?: number;
  zIndex?: number;
  alignment?: number;
  native?: boolean;
}

/** 多边形 */
export default class Polygon extends Mesh2D<IPolygonProps> {
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
      path,
      lineWidth,
      lineColor,
      lineAlpha,
      fillColor,
      fillAlpha,
      alpha,
      zIndex,
      alignment,
      native,
    } = this.props;
    zIndex && (this.view.zIndex = zIndex);
    DrawUtils.drawPolygon(this.view, {
      path: path.map(p => ({ x: p.x, y: p.y })),
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
    // const { position } = this.props;
    // this.view.position.set(position!.x, position!.y);
  }

  updateRotation() {
    this.view.rotation = this.props.rotation ?? 0;
  }

  updateScale() {
    this.view.scale.set(this.props.scale?.x ?? 1, this.props.scale?.y ?? 1);
  }
}
