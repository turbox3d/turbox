import { Mesh2D } from '@turbox3d/renderer-pixi';
import * as PIXI from 'pixi.js';
import DrawUtils from '../draw-utils/index';

interface Vec2 {
  x: number;
  y: number;
}

interface IPolygonProps {
  path: Vec2[];
  position?: Vec2;
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
  static defaultProps: Partial<IPolygonProps> = {
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: { x: 0, y: 0 },
  };
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
    // this.view.rotation = this.props.rotation!;
  }

  updateScale() {
    // const { scale } = this.props;
    // this.view.scale.set(scale!.x, scale!.y);
  }
}
