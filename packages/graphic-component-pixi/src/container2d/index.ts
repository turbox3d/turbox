import * as PIXI from 'pixi.js';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import { fail, Vec2 } from '@turbox3d/shared';
import DrawUtils from '../draw-utils/index';
import { IFitStyle } from '../draw-utils/drawRect';

interface IProps {
  x?: number;
  y?: number;
  position?: Vec2;
  width: number;
  height: number;
  /**
   * 传入的位置坐标是否是矩形中心点
   */
  central?: boolean;
  radius?: number;
  lineWidth?: number;
  lineColor?: number;
  lineAlpha?: number;
  fillColor?: number;
  fillAlpha?: number;
  alpha?: number;
  backgroundImage?: string;
  fit?: IFitStyle;
  padding?: string;
  margin?: string;
  zIndex?: number;
}

/** 正方形 */
export default class Container2d extends Mesh2D<IProps> {
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
      fillColor = 0x0,
      fillAlpha = 1,
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
      fillColor,
      fillAlpha,
      alpha,
    });
    DrawUtils.drawRect(this.mask, {
      x: x + lineWidth,
      y: y + lineWidth,
      width: width - lineWidth * 2,
      height: height - lineWidth * 2,
      central,
      radius: radius - lineWidth,
      fillColor,
    });
    if (!backgroundImage) {
      return;
    }
    const t = await PIXI.Texture.fromURL(backgroundImage).catch(() => {
      fail('Load container2d backgroundImage texture failed.');
    });
    if (!t) {
      return;
    }
    this.s.texture = t;
    this.s.visible = true;
    const [posX, posY] = central ? [x - width / 2, y - height / 2] : [x, y];
    const { width: tw, height: th } = t;
    const imgRatio = tw / th;
    const rw = width - lineWidth * 2;
    const rh = height - lineWidth * 2;
    const rectRatio = width / height;
    const center = { x: posX + width / 2, y: posY + height / 2 };
    const fillPos = { x: posX + lineWidth, y: posY + lineWidth };
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
    const { zIndex = 0 } = this.props;
    this.view.zIndex = zIndex;
  }

  updatePosition() {
    const { position } = this.props;
    if (position) {
      this.view.position.x = position.x;
      this.view.position.y = position.y;
    }
  }

  updateRotation() {
    //
  }

  updateScale() {
    //
  }
}
