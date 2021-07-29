import { EntityObject, Mesh3D } from '@turbox3d/turbox3d';
import * as THREE from 'three';
import { color16 } from './box';

interface IProps {
  model: EntityObject;
}

export class WireFrame extends Mesh3D<IProps> {
  protected reactivePipeLine = [
    this.updateGeometry,
  ];
  protected view = new THREE.Mesh();

  updateGeometry() {
    const { model } = this.props;
    const box = model.getBox3();
    const p0 = box[0];
    const p1 = box[1];
    const p3 = box[3];
    const p7 = box[7];
    const width = p3.x - p0.x;
    const height = p7.y - p0.y;
    const depth = p1.z - p0.z;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: color16() });
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material = material;
    this.view.position.set(0, 0, 0);
    this.view.add(line);
  }
}
