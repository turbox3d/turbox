import { Mesh3D } from '@turbox3d/renderer-three';
import { Vec3 } from '@turbox3d/shared';
import * as THREE from 'three';

interface ICubeProps {
  size: Vec3;
  color?: number;
}

export default class Cube extends Mesh3D<ICubeProps> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new THREE.Mesh();

  updateGeometry() {
    const geometry = new THREE.BoxGeometry(
      this.props.size.x,
      this.props.size.y,
      this.props.size.z
    );
    const material = new THREE.MeshPhongMaterial({ color: this.props.color || 0x00D000 });
    this.view.geometry = geometry;
    this.view.material = material;
    this.view.position.set(0, 0, 0);
  }
}
