import { IGraphicOption, setCommonOption } from './option';

interface IRectParam {
  /** The X of the bottom-left of the rectangle */
  x: number;
  /** The Y of the bottom-left of the rectangle */
  y: number;
  width: number;
  height: number;
  /**
   * 传入的位置坐标是否是矩形中心点
   */
  central?: boolean;
}

/**
 * 绘制一个矩形
 */
export function drawRect(graphic: PIXI.Graphics, param: IRectParam, option?: IGraphicOption) {
  // 样式配置
  setCommonOption(graphic, option);

  // 坐标配置
  const { x, y, width, height, central = false } = param;
  // 计算实际位置坐标
  const [posX, posY] = central ? [x - width / 2, y - height / 2] : [x, y];
  graphic.drawRect(posX, posY, width, height);
  graphic.endFill();
}
