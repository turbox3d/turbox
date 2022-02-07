import { Mesh2D } from '@turbox3d/renderer-pixi';
import * as PIXI from 'pixi.js';

export default class Placement extends Mesh2D {
  protected view = new PIXI.Graphics();
  protected reactivePipeLine = [
    this.updateGeometry,
    this.updateMaterial,
    this.updatePosition,
    this.updateRotation,
    this.updateScale,
  ];

  updateGeometry() {
    this.view.clear();
  }

  updateMaterial() {
    //
  }

  updatePosition() {
    // const { position } = this.props;
    // this.view.position.set(position!.x, position!.y);
  }

  updateRotation() {
    // this.view.rotation = this.props.rotation!;
  }

  updateScale() {
    // const { scale } = this.props;
    // this.view.scale.set(scale!.x, scale!.y);
  }
}
