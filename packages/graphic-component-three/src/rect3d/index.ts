import { Mesh3D } from '@turbox3d/renderer-three';
import * as THREE from 'three';

interface IRect3dProps {
  width: number;
  height: number;
  color?: number;
  side?: THREE.Side;
  opacity?: number;
}

export default class Rect3d extends Mesh3D<IRect3dProps> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new THREE.Mesh();

  updateGeometry() {
    const { width, height, color, side, opacity = 1 } = this.props;
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({ color: color || 0xFFE802, opacity, transparent: true, side: side || THREE.DoubleSide });
    this.view.geometry = geometry;
    this.view.material = material;
  }
}
