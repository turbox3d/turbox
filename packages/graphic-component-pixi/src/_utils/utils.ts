import * as THREE from 'three';
import { loadJSON } from '@turbox3d/shared';

interface IXY {
  x: number;
  y: number;
}

interface ITransform {
  offset?: IXY;
  size?: number;
  rotation?: number;
}

const fontUrl = 'https://gw.alicdn.com/bao/uploaded/TB1Pr1B0Nz1gK0jSZSgXXavwpXa.json?spm=a1z3i.a4.0.0.5a6feb1djymqis&file=TB1Pr1B0Nz1gK0jSZSgXXavwpXa.json';
let fontData;

/**
 * @description: 绘制数字
 * @param {PIXI} graphics graphics
 * @param {string} string 绘制数字的内容
 * @param {ITransform} transform 绘制数字的model matrix decompose
 * @return {*}
 */
export async function drawText(graphics: PIXI.Graphics, string: string | number, transform?: ITransform) {
  // generate shapes
  const size = transform?.size || 5;
  string = string.toString();
  if (!fontData) {
    fontData = await loadJSON(fontUrl);
  }
  const textShapes = new THREE.Font(fontData).generateShapes(string, size);

  // matrix parameter
  const halfH = size / 2; const halfW = string.length * 0.7 * halfH;
  const offset = { x: transform?.offset?.x || 0, y: transform?.offset?.y || 0 };
  const rotation = transform?.rotation || 0;

  // compose matrix
  const matrix = new THREE.Matrix3();
  const cos = Math.cos(rotation); const
    sin = Math.sin(rotation);
  matrix.set(cos, -sin, -cos * halfW + sin * halfH + offset.x,
    sin, cos, -sin * halfW - cos * halfH + offset.y,
    1, 1, 1);

  // eslint-disable-next-line no-shadow
  function drawLineByShape(graphics: PIXI.Graphics, curve: any, offset: IXY, rotation: number) {
    switch (curve.type) {
    case 'QuadraticBezierCurve': {
      const v0 = curve.v0.applyMatrix3(matrix);
      const v1 = curve.v1.applyMatrix3(matrix);
      const v2 = curve.v2.applyMatrix3(matrix);
      graphics.bezierCurveTo(v0.x, v0.y, v1.x, v1.y, v2.x, v2.y);
      break;
    }
    case 'LineCurve': {
      const v = curve.v2.applyMatrix3(matrix);
      graphics.lineTo(v.x, v.y);
      break;
    }
    default:
      break;
    }
  }

  // draw
  for (let i = 0; i < textShapes.length; i++) {
    graphics.beginFill(0x131313);
    const shape: THREE.Shape = textShapes[i];
    const shapeCurveLength = shape.curves.length;
    const v = (shape.curves[shapeCurveLength - 1] as any).v2.clone().applyMatrix3(matrix);
    graphics.moveTo(v.x, v.y);
    for (let j = 0; j < shapeCurveLength; j++) {
      const curve: THREE.Curve<THREE.Vector2> = shape.curves[j];
      drawLineByShape(graphics, curve, offset, rotation);
    }

    const holes = shape.holes;
    for (let j = 0; j < holes.length; j++) {
      const hole: THREE.Path = holes[j];
      graphics.beginHole();
      const v2 = hole.currentPoint.applyMatrix3(matrix);
      graphics.moveTo(v2.x, v2.y);
      for (let k = 0; k < hole.curves.length; k++) {
        const holeCurve = hole.curves[k];
        drawLineByShape(graphics, holeCurve, offset, rotation);
      }
      graphics.endHole();
    }
  }
}

/**
 * @description:根据两个端点生成尺寸线数据
 */
export function generateDimData(x0: number, y0: number, x1: number, y1: number) {
  // for (let i = 0; i < 100; i++) {
  const endLineL = 25;
  const endLine2L = 35;

  // compute line data
  const v = { x: x1 - x0, y: y1 - y0 };
  const vL = Math.sqrt(v.x * v.x + v.y * v.y);
  v.x /= vL;
  v.y /= vL;

  // anticlockwise 90 vector
  const v1 = { x: -v.y, y: v.x };
  // anticlockwise 45 vector
  const v2 = { x: 0.707 * v.x - 0.707 * v.y, y: 0.707 * v.x + 0.707 * v.y };

  const data = [
    // main body
    { x: x0, y: y0 }, { x: x1, y: y1 },

    // end line
    { x: x0 + endLineL * v1.x, y: y0 + endLineL * v1.y }, { x: x0 - endLineL * v1.x, y: y0 - endLineL * v1.y },
    { x: x1 + endLineL * v1.x, y: y1 + endLineL * v1.y }, { x: x1 - endLineL * v1.x, y: y1 - endLineL * v1.y },

    // 45° end line
    // { x: x0 + endLine2L * v2.x, y: y0 + endLine2L * v2.y },
    // { x: x0 - endLine2L * v2.x, y: y0 - endLine2L * v2.y },
    // { x: x1 + endLine2L * v2.x, y: y1 + endLine2L * v2.y },
    // { x: x1 - endLine2L * v2.x, y: y1 - endLine2L * v2.y },
  ];

  const length = vL;

  const angle = Math.atan2(v.y, v.x);

  return { data, length, angle };
}
