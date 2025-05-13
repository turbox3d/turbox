import * as PIXI from 'pixi.js';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import { Vec2 } from '@turbox3d/shared';

interface IText2dProps {
  text: string;
  style?: Partial<PIXI.TextStyle>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  scale?: Vec2;
  central?: boolean;
  zIndex?: number;
  getBounds?: (bounds: Vec2) => void;
}

/** UI组件-文字 */
export default class Text2d extends Mesh2D<IText2dProps> {
  protected view = new PIXI.Text('');
  protected reactivePipeLine = [
    this.updateGeometry,
    this.updateMaterial,
    this.updatePosition,
    this.updateRotation,
    this.updateScale,
  ];

  updateGeometry() {
    const {
      text,
      style,
      width,
      height,
    } = this.props;
    this.view.text = text;
    this.view.style = style ? new PIXI.TextStyle(style) : new PIXI.TextStyle({
      fontSize: 16,
      fontFamily: 'Arial',
    });
    if (width) {
      this.view.width = width;
    }
    if (height) {
      this.view.height = height;
    }
  }

  updateMaterial() {
    const { zIndex = 0 } = this.props;
    this.view.zIndex = zIndex;
  }

  updatePosition() {
    const { x = 0, y = 0, central = false } = this.props;
    const [posX, posY] = central ? [x - this.view.width / 2, y - this.view.height / 2] : [x, y];
    this.view.position.x = posX;
    this.view.position.y = posY;
  }

  updateRotation() {
    this.view.rotation = this.props.rotation ?? 0;
  }

  updateScale() {
    this.view.scale.set(this.props.scale?.x ?? 1, this.props.scale?.y ?? 1);
  }

  private getBounds() {
    const { getBounds } = this.props;
    if (getBounds) {
      const { width, height } = this.view.getLocalBounds();
      getBounds({
        x: width,
        y: height,
      });
    }
  }

  componentDidMount() {
    this.getBounds();
  }

  componentDidUpdate() {
    this.getBounds();
  }
}
