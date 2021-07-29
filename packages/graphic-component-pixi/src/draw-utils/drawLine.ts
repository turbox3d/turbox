import { IGraphicOption, parseGraphicOption } from './option';

interface ILineParam {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface ILinesParam {
  points: number[];
}

/**
 * 绘制一条从 (x0, y0) 到 (x1, y1) 的线
 */
export function drawLine(graphic: PIXI.Graphics, param: ILineParam, option?: IGraphicOption) {
  // 样式配置
  const { lineWidth, lineColor, lineAlpha } = parseGraphicOption(option);
  graphic.lineStyle(lineWidth, lineColor, lineAlpha);
  // 坐标配置
  const { x0, y0, x1, y1 } = param;
  graphic.moveTo(x0, y0);
  graphic.lineTo(x1, y1);
  return graphic;
}

export function drawLines(graphic: PIXI.Graphics, param: ILinesParam, option?: IGraphicOption) {
  // 样式配置
  const { lineWidth, lineColor, lineAlpha } = parseGraphicOption(option);
  graphic.lineStyle(lineWidth, lineColor, lineAlpha);
  // 坐标配置
  const [x0, y0] = param.points;
  graphic.moveTo(x0, y0);
  for (let index = 2; index < param.points.length; index += 2) {
    graphic.lineTo(param.points[index], param.points[index + 1]);
  }
  return graphic;
}
