import * as PIXI from 'pixi.js';
import { ItemEntity } from '../../models/entity/item';

export const getMaxWidthWord = (target: ItemEntity) => {
  const style = new PIXI.TextStyle(target.getFontStyle());
  const words = target.text.trim().split(/\s+/);
  const maxWidthWord = words.reduce((prev, cur) => {
    const prevWidth = new PIXI.Text(prev, style).width;
    const curWidth = new PIXI.Text(cur, style).width;
    if (prevWidth > curWidth) {
      return prev;
    }
    return cur;
  });
  const width = new PIXI.Text(maxWidthWord, style).width;
  return width;
};

export const getTextBounds = (target: ItemEntity) => {
  const style = new PIXI.TextStyle(target.getFontStyle());
  const text = target.text.trim();
  const { width, height } = new PIXI.Text(text, style);
  return {
    width,
    height,
  };
};
