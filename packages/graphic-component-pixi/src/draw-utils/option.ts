class GraphicOption {
  // 线条样式
  lineWidth = 0;
  lineColor = 0x0;
  lineAlpha = 1;
  // 填充样式
  fillColor = 0x0;
  fillAlpha = 1;
  alpha = 1;
}

const defaultOption = new GraphicOption();

export type IGraphicOption = Partial<GraphicOption>;

/** 解析 Option */
export function parseGraphicOption(option?: IGraphicOption) {
  return option ? { ...defaultOption, ...option } : defaultOption;
}

/** 直接设置通用的样式配置 */
export function setCommonOption(graphic: PIXI.Graphics, option?: IGraphicOption) {
  // 样式配置
  const { fillColor = defaultOption.fillColor, fillAlpha = defaultOption.fillAlpha, lineWidth = defaultOption.lineWidth, lineColor = defaultOption.lineColor, lineAlpha = defaultOption.lineAlpha, alpha = defaultOption.alpha } = parseGraphicOption(option);
  graphic.alpha = alpha;
  graphic.beginFill(fillColor, fillAlpha);
  graphic.lineStyle(lineWidth, lineColor, lineAlpha);
}
