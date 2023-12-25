import * as PIXI from 'pixi.js';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import { Vec2 } from '@turbox3d/shared';
import Container2d from '../container2d';

interface IProps {
  text: string;
  style?: PIXI.TextStyle | Partial<PIXI.TextStyle>;
  position?: Vec2;
  zIndex?: number;
  /** top,right,bottom,left */
  // padding?: string;
  /** top,right,bottom,left */
  margin?: string;
}

/** UI组件-文字 */
export default class Text2d extends Mesh2D<IProps> {
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
    } = this.props;
    this.view.text = text;
    this.view.style = style || new PIXI.TextStyle({
      fontSize: 16,
      fontFamily: 'Arial',
    });
  }

  updateMaterial() {
    const { zIndex = 0 } = this.props;
    this.view.zIndex = zIndex;
  }

  updatePosition() {
    const { position, margin, height } = this.props;
    if (position) {
      this.view.position.x = position.x || 0;
      this.view.position.y = position.y || 0;
    } else {
      const [top, right, bottom, left] = margin?.split(',').map(n => parseInt(n, 10)) || [0, 0, 0, 0];
      const parentNode = this._vNode.parent;
      if (parentNode && parentNode.instance instanceof Container2d) {
        this.view.position.x += left;
        if (parentNode.child === this._vNode) {
          this.view.position.y += top;
        }
        if (this._vNode.sibling) {
          const siblingMargin = this._vNode.sibling?.props.margin?.split(',').map(n => parseInt(n, 10)) || [0, 0, 0, 0];
          if (this._vNode.sibling?.instance instanceof Mesh2D) {
            ((this._vNode.sibling?.instance as any).view as PIXI.Container).position.y = this.view.position.y + height + bottom + siblingMargin[0];
          }
        }
      }
    }
  }

  updateRotation() {
    //
  }

  updateScale() {
    //
  }
}
