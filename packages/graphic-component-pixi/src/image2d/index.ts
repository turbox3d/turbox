import * as PIXI from 'pixi.js';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import { fail, Vec2 } from '@turbox3d/shared';
import DrawUtils from '../draw-utils/index';
import { IFitStyle } from '../draw-utils/drawRect';

export interface IImage2dProps {
  x?: number;
  y?: number;
  width: number;
  height: number;
  rotation?: number;
  scale?: Vec2;
  /**
   * 传入的位置坐标是否是矩形中心点
   */
  central?: boolean;
  radius?: number;
  lineWidth?: number;
  lineColor?: number;
  lineAlpha?: number;
  /**
   * 边框内扩、外扩
   */
  alignment?: number;
  native?: boolean;
  fillColor?: number;
  fillAlpha?: number;
  alpha?: number;
  backgroundImage?: string | HTMLImageElement;
  materialDirection?: Vec2;
  fit?: IFitStyle;
  zIndex?: number;
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
      width,
      height,
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
      x: 0,
      y: 0,
      width,
      height,
      central: false,
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
    const fillPos = { x: lineWidth * alignParam, y: lineWidth * alignParam };
    const rw = width - lineWidth * 2 * alignParam;
    const rh = height - lineWidth * 2 * alignParam;
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
    const center = { x: width / 2, y: height / 2 };
    DrawUtils.drawRect(this.mask, {
      x: fillPos.x,
      y: fillPos.y,
      width: rw,
      height: rh,
      central: false,
      radius: radius - lineWidth * alignParam,
    });
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
      this.mask.position.set(this.s.position.x, this.s.position.y);
      this.mask.width = this.s.width;
      this.mask.height = this.s.height;
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
    const { x = 0, y = 0, central = false, width, height } = this.props;
    const [posX, posY] = central ? [x - width / 2, y - height / 2] : [x, y];
    this.view.position.x = posX;
    this.view.position.y = posY;
  }

  updateRotation() {
    this.view.rotation = this.props.rotation ?? 0;
  }

  updateScale() {
    this.view.scale.set(this.props.scale?.x ?? 1, this.props.scale?.y ?? 1);
  }
}
