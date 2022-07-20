import { Mesh3D } from '@turbox3d/renderer-three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { Vec3 } from '@turbox3d/shared';

interface IFatLineProps {
  position: Vec3;
  rotation: Vec3;
  linePositions: number[];
  dashed?: boolean;
  linewidth?: number;
  color?: number;
  dashScale?: number;
  dashSize?: number;
  gapSize?: number;
  looped?: boolean;
}

export default class FatLine extends Mesh3D<IFatLineProps> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new Line2();

  private updateGeometry() {
    const { position, rotation, linePositions, dashed = false, linewidth = 0.002, color = 0xFFE802, dashScale = 0.4, dashSize = 1, gapSize = 1, looped = false } = this.props;
    const geometry = new LineGeometry();
    geometry.setPositions(looped ? [...linePositions, linePositions[0], linePositions[1], linePositions[2]] : linePositions);
    const material = new LineMaterial({
      color,
      linewidth,
      dashed,
      dashScale,
      dashSize,
      gapSize,
      alphaToCoverage: true,
    });
    this.view.geometry = geometry;
    this.view.material = material;
    this.view.position.set(position.x, position.y, position.z);
    this.view.rotation.set(rotation.x, rotation.y, rotation.z);
    this.view.computeLineDistances();
  }
}
