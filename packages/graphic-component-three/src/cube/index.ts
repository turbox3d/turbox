import { EntityObject } from '@turbox3d/design-engine';
import { Mesh3D } from '@turbox3d/renderer-three';
import * as THREE from 'three';

interface ICubeProps {
  model: EntityObject;
  color?: number;
}

export default class Cube extends Mesh3D<ICubeProps> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new THREE.Mesh();

  updateGeometry() {
    const geometry = new THREE.BoxGeometry(
      this.props.model.size.x,
      this.props.model.size.y,
      this.props.model.size.z
    );
    const material = new THREE.MeshPhongMaterial({ color: this.props.color || 0x00D000 });
    this.view.geometry = geometry;
    this.view.material = material;
    this.view.position.set(0, 0, 0);
  }
}
