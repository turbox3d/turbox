import * as PIXI from 'pixi.js';
import { Mesh2D } from '@turbox3d/renderer-pixi';
import { Vec2 } from '@turbox3d/shared';

interface IProps {
  text: string;
  style?: PIXI.TextStyle;
  position?: Vec2;
  zIndex?: number;
}

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
    this.view.style = style;
  }

  updateMaterial() {
    const { zIndex = 0 } = this.props;
    this.view.zIndex = zIndex;
  }

  updatePosition() {
    const { position } = this.props;
    if (position) {
      this.view.x = position.x;
      this.view.y = position.y;
    }
  }

  updateRotation() {
    //
  }

  updateScale() {
    //
  }
}
