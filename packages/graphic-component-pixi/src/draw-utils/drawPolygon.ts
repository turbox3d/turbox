import { Point } from 'pixi.js';
import { IGraphicOption, setCommonOption } from './option';

interface IPolygonParam {
  path: Array<{ x: number; y: number }>;
}

export function drawPolygon(graphic: PIXI.Graphics, param: IPolygonParam, option?: IGraphicOption) {
  // 样式配置
  setCommonOption(graphic, option);

  const points = param.path.map(p => new Point(p.x, p.y));
  graphic.drawPolygon(points);
  graphic.endFill();
}
