import * as PIXI from 'pixi.js';
import { ComponentProps, Mesh2D } from '@turbox3d/renderer-pixi';
import { fail, Vec2, cropImage } from '@turbox3d/shared';
import DrawUtils from '../draw-utils';
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
   * 边框内扩 0、外扩 1
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

  componentDidMount() {
    this.g.zIndex = -1;
    this.s.zIndex = -1;
    this.view.addChild(this.g);
    this.view.addChild(this.s);
  }

  async componentWillUpdate(prevProps: ComponentProps<IImage2dProps>) {
    if (prevProps.backgroundImage !== this.props.backgroundImage) {
      this.s.visible = false;
      const t = await this.loadTextureResource();
      if (!t) {
        return;
      }
      this.s.texture = t;
    }
  }

  private async loadTextureResource() {
    const { backgroundImage } = this.props;
    if (!backgroundImage) {
      return;
    }
    let t: PIXI.Texture | undefined;
    if (backgroundImage instanceof HTMLImageElement) {
      t = await PIXI.Texture.fromLoader(backgroundImage, backgroundImage.src).catch(() => {
        fail('Load Image2d backgroundImage texture failed.');
      });
    } else {
      t = await PIXI.Texture.fromURL(backgroundImage).catch(() => {
        fail('Load Image2d backgroundImage texture failed.');
      });
    }
    return t;
  }

  async updateGeometry() {
    this.g.clear();
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
    let alignParam = alignment;
    if (alignment === 0) {
      alignParam = 1;
    } else if (alignment === 1) {
      alignParam = 0;
    }
    const fillPos = { x: lineWidth * alignParam, y: lineWidth * alignParam };
    const rw = width - lineWidth * 2 * alignParam;
    const rh = height - lineWidth * 2 * alignParam;

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

    if (!this.s.texture.baseTexture.valid) {
      const t = await this.loadTextureResource();
      if (!t) {
        return;
      }
      this.s.texture = t;
    }

    const { width: tw, height: th } = this.s.texture;
    const imgRatio = tw / th;
    const rectRatio = width / height;
    const center = { x: width / 2, y: height / 2 };

    if (fit === 'none') {
      if (rectRatio > 1) {
        this.s.width = rw;
        this.s.height = rw / imgRatio;
      } else {
        this.s.width = rh * imgRatio;
        this.s.height = rh;
      }
      this.s.position.set(center.x - this.s.width / 2, center.y - this.s.height / 2);
    } else if (fit === 'fill') {
      this.s.width = rw;
      this.s.height = rh;
      this.s.position.set(fillPos.x, fillPos.y);
    } else if (fit === 'cover') {
      if (imgRatio <= rectRatio) {
        const ratio = rw / tw;
        if (!this.s.texture.baseTexture.valid) {
          const { element } = await cropImage(backgroundImage, { start: { x: 0, y: th / 2 - rh / ratio / 2 }, end: { x: tw, y: th / 2 + rh / ratio / 2 }});
          if (element) {
            this.s.texture = PIXI.Texture.from(element);
          }
        }
        this.s.width = rw;
        this.s.height = rh;
      } else {
        const ratio = rh / th;
        if (!this.s.texture.baseTexture.valid) {
          const { element } = await cropImage(backgroundImage, { start: { x: tw / 2 - rw / ratio / 2, y: 0 }, end: { x: tw / 2 + rw / ratio / 2, y: th }});
          if (element) {
            this.s.texture = PIXI.Texture.from(element);
          }
        }
        this.s.width = rw;
        this.s.height = rh;
      }
      this.s.position.set(fillPos.x, fillPos.y);
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
    // 方便做贴图的镜像翻转
    this.s.anchor.set(0.5, 0.5);
    // anchor 设置为 0.5 后，此处需要将贴图调整回去
    this.s.position.set(this.s.position.x + this.s.width / 2, this.s.position.y + this.s.height / 2);
    this.s.visible = true;
  }

  updateMaterial() {
    const { zIndex = 0, materialDirection = { x: 1, y: 1 } } = this.props;
    this.view.zIndex = zIndex;
    this.s.scale.set(materialDirection.x > 0 ? Math.abs(this.s.scale.x) : -Math.abs(this.s.scale.x), materialDirection.y > 0 ? Math.abs(this.s.scale.y) : -Math.abs(this.s.scale.y));
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
