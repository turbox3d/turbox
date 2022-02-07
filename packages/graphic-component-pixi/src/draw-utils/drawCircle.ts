import { IGraphicOption, setCommonOption } from './option';

interface ICircleParam {
  cx: number;
  cy: number;
  radius: number;
}

export function drawCircle(graphic: PIXI.Graphics, param: ICircleParam, option?: IGraphicOption) {
  // 样式配置
  setCommonOption(graphic, option);

  const { cx, cy, radius } = param;
  graphic.drawCircle(cx, cy, radius);
  graphic.endFill();
}
