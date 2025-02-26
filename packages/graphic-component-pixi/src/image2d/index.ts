import * as PIXI from 'pixi.js';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import { fail, Vec2 } from '@turbox3d/shared';
import DrawUtils from '../draw-utils/index';
import { IFitStyle } from '../draw-utils/drawRect';
import { computeFlowLayoutPosition } from '../_utils/utils';

interface IImage2dProps {
  width: number;
  height: number;
  x?: number;
  y?: number;
  position?: Vec2;
  /**
   * 传入的位置坐标是否是矩形中心点
   */
  central?: boolean;
  radius?: number;
  lineWidth?: number;
  lineColor?: number;
  lineAlpha?: number;
  alignment?: number;
  native?: boolean;
  fillColor?: number;
  fillAlpha?: number;
  alpha?: number;
  backgroundImage?: string | HTMLImageElement;
  materialDirection?: Vec2;
  fit?: IFitStyle;
  /** top,right,bottom,left */
  // padding?: string;
  /** top,right,bottom,left */
  margin?: string;
  zIndex?: number;
  /** 使用类似 css 的流式布局定位，开启后 position 将会失效 */
  useFlowLayout?: boolean;
}

/** UI组件-图片 */
export default class Image2d extends Mesh2D<IImage2dProps> {
  protected view: PIXI.Container;
  protected reactivePipeLine = [
    this.updateGeometry,
    this.updateMaterial,
    this.updatePosition,
    this.updateRotation,
    this.updateScale,
  ];
  private g = new PIXI.Graphics();
  private s = new PIXI.Sprite();
  private mask = new PIXI.Graphics();

  componentDidMount() {
    this.g.zIndex = -1;
    this.s.zIndex = -1;
    this.mask.zIndex = -1;
    this.view.addChild(this.g);
    this.view.addChild(this.s);
    this.view.addChild(this.mask);
  }

  async updateGeometry() {
    this.g.clear();
    this.mask.clear();
    this.s.visible = false;
    const {
      x = 0,
      y = 0,
      width,
      height,
      central = false,
      radius = 0,
      lineWidth = 0,
      lineColor = 0x0,
      lineAlpha = 1,
      alignment = 0,
      native,
      fillColor = 0x0,
      fillAlpha = 0,
      alpha = 1,
      backgroundImage = '',
      fit = 'none',
    } = this.props;
    DrawUtils.drawRect(this.g, {
      x,
      y,
      width,
      height,
      central,
      radius,
      lineWidth,
      lineColor,
      lineAlpha,
      alignment,
      native,
      fillColor,
      fillAlpha,
      alpha,
    });
    let alignParam = alignment;
    if (alignment === 0) {
      alignParam = 1;
    } else if (alignment === 1) {
      alignParam = 0;
    }
    const [posX, posY] = central ? [x - width / 2, y - height / 2] : [x, y];
    const fillPos = { x: posX + lineWidth * alignParam, y: posY + lineWidth * alignParam };
    const rw = width - lineWidth * 2 * alignParam;
    const rh = height - lineWidth * 2 * alignParam;
    DrawUtils.drawRect(this.mask, {
      x: fillPos.x,
      y: fillPos.y,
      width: rw,
      height: rh,
      central: false,
      radius: radius - lineWidth * alignParam,
      fillColor,
      native,
    });
    if (!backgroundImage) {
      return;
    }
    let t: PIXI.Texture | undefined;
    if (backgroundImage instanceof HTMLImageElement) {
      t = PIXI.Texture.from(backgroundImage);
      t.baseTexture.setSize(rw, rh);
    } else {
      t = await PIXI.Texture.fromURL(backgroundImage).catch(() => {
        fail('Load Image2d backgroundImage texture failed.');
      });
    }
    if (!t) {
      return;
    }
    this.s.texture = t;
    this.s.visible = true;
    const { width: tw, height: th } = t;
    const imgRatio = tw / th;
    const rectRatio = width / height;
    const center = { x: posX + width / 2, y: posY + height / 2 };
    if (fit === 'none') {
      this.s.position.set(center.x - tw / 2, center.y - th / 2);
    } else if (fit === 'fill') {
      this.s.width = rw;
      this.s.height = rh;
      this.s.position.set(fillPos.x, fillPos.y);
    } else if (fit === 'cover') {
      if (imgRatio <= rectRatio) {
        this.s.width = rw;
        this.s.height = rw / imgRatio;
        this.s.position.set(fillPos.x, fillPos.y + rh / 2 - rw / imgRatio / 2);
      } else {
        this.s.width = rh * imgRatio;
        this.s.height = rh;
        this.s.position.set(fillPos.x + rw / 2 - (rh * imgRatio) / 2, fillPos.y);
      }
    } else if (fit === 'contain') {
      if (imgRatio <= rectRatio) {
        this.s.width = rh * imgRatio;
        this.s.height = rh;
        this.s.position.set(fillPos.x + rw / 2 - (rh * imgRatio) / 2, fillPos.y);
      } else {
        this.s.width = rw;
        this.s.height = rw / imgRatio;
        this.s.position.set(fillPos.x, fillPos.y + rh / 2 - rw / imgRatio / 2);
      }
    }
    this.s.mask = this.mask;
  }

  updateMaterial() {
    const { zIndex = 0, materialDirection = { x: 1, y: 1 } } = this.props;
    this.view.zIndex = zIndex;
    // this.s.anchor.set(0.5, 0.5);
    this.s.scale.set(materialDirection.x, materialDirection.y);
  }

  updatePosition() {
    const { position = { x: 0, y: 0 }, margin, central = false, useFlowLayout = false } = this.props;
    if (!useFlowLayout) {
      const [posX, posY] = central ? [position.x - this.view.width / 2, position.y - this.view.height / 2] : [position.x, position.y];
      this.view.position.x = posX;
      this.view.position.y = posY;
      return;
    }
    computeFlowLayoutPosition.call(this, central, margin);
  }

  updateRotation() {
    //
  }

  updateScale() {
    //
  }
}
