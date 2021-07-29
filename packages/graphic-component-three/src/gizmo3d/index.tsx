import { Mesh3D } from '@turbox3d/graphic-view-three';

export default class Gizmo3d extends Mesh3D {
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
