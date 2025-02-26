import * as PIXI from 'pixi.js';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import { Vec2 } from '@turbox3d/shared';
import { computeFlowLayoutPosition } from '../_utils/utils';

interface IText2dProps {
  text: string;
  style?: PIXI.TextStyle | Partial<PIXI.TextStyle>;
  position?: Vec2;
  zIndex?: number;
  height?: number;
  width?: number;
  /** top,right,bottom,left */
  // padding?: string;
  /** top,right,bottom,left */
  margin?: string;
  central?: boolean;
  /** 使用类似 css 的流式布局定位，开启后 position 将会失效 */
  useFlowLayout?: boolean;
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
    this.view.style = style || new PIXI.TextStyle({
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
