import { Mesh3D } from '@turbox3d/renderer-three';
import { Vec3 } from '@turbox3d/shared';
import * as THREE from 'three';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { Wireframe as WireFrame } from 'three/examples/jsm/lines/Wireframe.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

interface IProps {
  size: Vec3;
  color?: number;
  lineWidth?: number;
}

export default class Wireframe extends Mesh3D<IProps> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new WireFrame();

  private updateGeometry() {
    const { size, color, lineWidth } = this.props;
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const wireframe = new THREE.EdgesGeometry(geometry);
    const material = new LineMaterial({ color: color || 0xFFE802, linewidth: lineWidth || 0.002 });
    const lineGeo = new LineSegmentsGeometry().fromEdgesGeometry(wireframe);
    this.view.geometry = lineGeo;
    this.view.material = material;
  }
}
