import { drawLine } from './drawLine';
import { IGraphicOption, parseGraphicOption } from './option';

interface IPathParam {
  path: Array<{ x: number; y: number }>;
  /**
   * 绘制的路径是否闭合
   *
   * 默认：false，不闭合
   */
  closed?: boolean;
}

/**
 * 绘制一条路径
 */
export function drawPath(graphic: PIXI.Graphics, param: IPathParam, option?: IGraphicOption) {
  const { path, closed = false } = param;
  const length = path.length - 1;

  if (length < 1) {
    return;
  }

  // 样式配置
  const { lineWidth, lineColor, lineAlpha } = parseGraphicOption(option);
  graphic.lineStyle(lineWidth, lineColor, lineAlpha);

  for (let i = 0; i < length; i++) {
    drawLine(graphic, {
      x0: path[i].x,
      y0: path[i].y,
      x1: path[i + 1].x,
      y1: path[i + 1].y,
    }, { lineWidth, lineColor, lineAlpha });
  }

  if (closed) {
    drawLine(graphic, {
      x0: path[length].x,
      y0: path[length].y,
      x1: path[0].x,
      y1: path[0].y,
    }, { lineWidth, lineColor, lineAlpha });
  }
}
