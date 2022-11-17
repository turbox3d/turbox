import { fail } from '@turbox3d/shared';
import * as PIXI from 'pixi.js';
import { IFitStyle } from './drawRect';

class GraphicOption {
  // 线条样式
  lineWidth = 0;
  lineColor = 0x0;
  lineAlpha = 1;
  alignment = 0.5;
  native = false;
  // 填充样式
  fillColor = 0x0;
  fillAlpha = 1;
  // 整体透明度
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
  const {
    fillColor = defaultOption.fillColor,
    fillAlpha = defaultOption.fillAlpha,
    lineWidth = defaultOption.lineWidth,
    lineColor = defaultOption.lineColor,
    lineAlpha = defaultOption.lineAlpha,
    alignment = defaultOption.alignment,
    native = defaultOption.native,
    alpha = defaultOption.alpha,
  } = parseGraphicOption(option);
  graphic.alpha = alpha;
  graphic.beginFill(fillColor, fillAlpha);
  graphic.lineStyle(lineWidth, lineColor, lineAlpha, alignment, native);
}

class FillTextureOption {
  fillColor = 0xffffff;
  fillAlpha = 1;
  fit: IFitStyle = 'none';
  posX = 0;
  posY = 0;
  width = 0;
  height = 0;
}

const defaultFillTextureOption = new FillTextureOption();

export type IFillTextureOption = Partial<FillTextureOption>;

export function parseFillTextureOption(option?: IFillTextureOption) {
  return option ? { ...defaultFillTextureOption, ...option } : defaultFillTextureOption;
}

/** 设置填充贴图 */
export async function setFillTexture(graphic: PIXI.Graphics, fillTextureUrl: string, option?: IFillTextureOption) {
  const t = await PIXI.Texture.fromURL(fillTextureUrl).catch(() => {
    fail('Load fill texture failed.');
  });
  if (!t) {
    return;
  }
  const {
    fillColor = defaultFillTextureOption.fillColor,
    fillAlpha = defaultFillTextureOption.fillAlpha,
    fit = defaultFillTextureOption.fit,
    posX = defaultFillTextureOption.posX,
    posY = defaultFillTextureOption.posY,
    width: rw = defaultFillTextureOption.width,
    height: rh = defaultFillTextureOption.height,
  } = parseFillTextureOption(option);
  const { width, height } = t;
  const imgRatio = width / height;
  const rectRatio = rw / rh;
  const center = { x: posX + rw / 2, y: posY + rh / 2 };
  const matrix = new PIXI.Matrix();
  if (fit === 'none') {
    matrix.translate(center.x - width / 2, center.y - height / 2);
  } else if (fit === 'fill') {
    matrix.scale(rw / width, rh / height);
    matrix.translate(posX, posY);
  } else if (fit === 'cover') {
    if (imgRatio <= rectRatio) {
      matrix.scale(rw / width, rw / imgRatio / height);
      matrix.translate(posX, posY + rh / 2 - rw / imgRatio / 2);
    } else {
      matrix.scale((rh * imgRatio) / width, rh / height);
      matrix.translate(posX + rw / 2 - (rh * imgRatio) / 2, posY);
    }
  } else if (fit === 'contain') {
    if (imgRatio <= rectRatio) {
      matrix.scale((rh * imgRatio) / width, rh / height);
      matrix.translate(posX + rw / 2 - (rh * imgRatio) / 2, posY);
    } else {
      matrix.scale(rw / width, rw / imgRatio / height);
      matrix.translate(posX, posY + rh / 2 - rw / imgRatio / 2);
    }
  }
  graphic.beginTextureFill({
    texture: t,
    color: fillColor,
    alpha: fillAlpha,
    matrix,
  });
}
