import * as PIXI from 'pixi.js';
import { IGraphicOption, setCommonOption, setFillTexture } from './option';

export type IFitStyle = 'none' | 'fill' | 'cover' | 'contain';

interface IRectParam {
  x: number;
  y: number;
  width: number;
  height: number;
  /**
   * 传入的位置坐标是否是矩形中心点
   */
  central?: boolean;
  /** 圆角 */
  radius?: number;
  backgroundImage?: string;
  /**
   * 背景图适配方式：图片原尺寸居中；拉伸图片填充区域；图片最小化得覆盖区域；图片最大化得内含在区域
   * 注意：贴图在矩形区域留白的部分会被repeat填满，且无法修改铺贴方式(Pixi实现问题，如需留白请使用Container组件，不要使用此基础绘制接口)
   */
  fit?: IFitStyle;
}

/**
 * 绘制一个矩形
 */
export async function drawRect(graphic: PIXI.Graphics, param: IRectParam & IGraphicOption) {
  // 样式配置
  setCommonOption(graphic, param);
  // 坐标配置
  const { x, y, width, height, central = false, radius = 0, backgroundImage = '', fit, fillColor, fillAlpha } = param;
  // 计算实际位置坐标
  const [posX, posY] = central ? [x - width / 2, y - height / 2] : [x, y];
  // 计算填充贴图样式
  if (backgroundImage) {
    await setFillTexture(graphic, backgroundImage, {
      fillColor,
      fillAlpha,
      fit,
      posX,
      posY,
      width,
      height,
    });
  }
  if (radius > 0) {
    const r = Math.min(radius, Math.min(width, height) / 2);
    graphic.moveTo(posX + r, posY);
    if (width !== 2 * r) {
      graphic.lineTo(posX + width - r, posY);
    }
    graphic.arcTo(posX + width, posY, posX + width, posY + r, r);
    if (height !== 2 * r) {
      graphic.lineTo(posX + width, posY + height - r);
    }
    graphic.arcTo(posX + width, posY + height, posX + width - r, posY + height, r);
    if (width !== 2 * r) {
      graphic.lineTo(posX + r, posY + height);
    }
    graphic.arcTo(posX, posY + height, posX, posY + height - r, r);
    if (height !== 2 * r) {
      graphic.lineTo(posX, posY + r);
    }
    graphic.arcTo(posX, posY, posX + r, posY, r);
    // graphic.drawRoundedRect(posX, posY, width, height, radius);
  } else {
    graphic.drawRect(posX, posY, width, height);
  }
  graphic.endFill();
}
