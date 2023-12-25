import THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import * as PIXI from 'pixi.js';

interface IXY {
  x: number;
  y: number;
}

interface ITransform {
  offset?: IXY;
  size?: number;
  rotation?: number;
}

function drawLineByShape(graphics: PIXI.Graphics, curve: THREE.Curve<THREE.Vector2>, matrix: THREE.Matrix3) {
  const c = curve.toJSON() as any;
  switch (curve.type) {
  case 'QuadraticBezierCurve': {
    const v0 = new THREE.Vector2().fromArray(c.v0).applyMatrix3(matrix);
    const v1 = new THREE.Vector2().fromArray(c.v1).applyMatrix3(matrix);
    const v2 = new THREE.Vector2().fromArray(c.v2).applyMatrix3(matrix);
    graphics.bezierCurveTo(v0.x, v0.y, v1.x, v1.y, v2.x, v2.y);
    break;
  }
  case 'LineCurve': {
    const v = new THREE.Vector2().fromArray(c.v2).applyMatrix3(matrix);
    graphics.lineTo(v.x, v.y);
    break;
  }
  default:
    break;
  }
}

/**
 * 绘制字体
 * @param {PIXI} graphics graphics
 * @param {string} string 文本
 * @param {ITransform} transform 绘制的 model matrix decompose
 */
export async function drawText(
  graphics: PIXI.Graphics,
  string: string | number,
  transform?: ITransform,
  options?: {
    color?: number;
    fontUrl?: string;
  }
) {
  // generate shapes
  const defaultOps = {
    color: 0x131313,
    fontUrl: ''
  };
  const ops = options || defaultOps;
  const size = transform?.size || 5;
  const font = await new FontLoader().loadAsync(ops.fontUrl || defaultOps.fontUrl);
  const str = string.toString();
  const textShapes = font.generateShapes(str, size);

  // matrix parameter
  const halfH = size / 2;
  const halfW = str.length * 0.7 * halfH;
  const offset = { x: transform?.offset?.x || 0, y: transform?.offset?.y || 0 };
  const rotation = transform?.rotation || 0;

  // compose matrix
  const matrix = new THREE.Matrix3();
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  matrix.set(
    cos,
    -sin,
    -cos * halfW + sin * halfH + offset.x,
    sin,
    cos,
    -sin * halfW - cos * halfH + offset.y,
    1,
    1,
    1
  );

  // draw
  for (let i = 0; i < textShapes.length; i++) {
    graphics.beginFill(ops.color || defaultOps.color);
    const shape: THREE.Shape = textShapes[i];
    const shapeCurveLength = shape.curves.length;
    const curve = shape.curves[shapeCurveLength - 1];
    const v = new THREE.Vector2().fromArray((curve.toJSON() as any).v2).clone().applyMatrix3(matrix);
    graphics.moveTo(v.x, v.y);
    for (let j = 0; j < shapeCurveLength; j++) {
      drawLineByShape(graphics, shape.curves[j], matrix);
    }

    const holes = shape.holes;
    for (let j = 0; j < holes.length; j++) {
      const hole: THREE.Path = holes[j];
      graphics.beginHole();
      const v2 = hole.currentPoint.applyMatrix3(matrix);
      graphics.moveTo(v2.x, v2.y);
      for (let k = 0; k < hole.curves.length; k++) {
        drawLineByShape(graphics, hole.curves[k], matrix);
      }
      graphics.endHole();
    }
  }
}
