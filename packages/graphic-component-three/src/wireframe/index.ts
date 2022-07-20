import { Mesh3D } from '@turbox3d/renderer-three';
import { EntityObject } from '@turbox3d/design-engine';
import * as THREE from 'three';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { Wireframe as WireFrame } from 'three/examples/jsm/lines/Wireframe.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

interface IProps {
  model: EntityObject;
  color?: number;
  lineWidth?: number;
}

export default class Wireframe extends Mesh3D<IProps> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new WireFrame();

  private updateGeometry() {
    const { model, color, lineWidth } = this.props;
    const geometry = new THREE.BoxGeometry(model.size.x, model.size.y, model.size.z);
    const wireframe = new THREE.EdgesGeometry(geometry);
    const material = new LineMaterial({ color: color || 0xFFE802, linewidth: lineWidth || 0.002 });
    const lineGeo = new LineSegmentsGeometry().fromEdgesGeometry(wireframe);
    this.view.geometry = lineGeo;
    this.view.material = material;
  }
}
