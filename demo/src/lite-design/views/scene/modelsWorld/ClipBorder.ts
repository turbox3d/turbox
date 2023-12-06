import { BufferGeometry, LineDashedMaterial, LineSegments, Vector3 } from 'three';

import { Reactive, Mesh3D } from '@turbox3d/turbox';

import { ClipPointEntity } from '../../../models/entity/clipPoint';

@Reactive
export class ClipBorder extends Mesh3D<{ clipPoints: ClipPointEntity[] }> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new LineSegments(
    new BufferGeometry(),
    new LineDashedMaterial({ color: 0xffffff, dashSize: 10, gapSize: 5 })
  );

  private updateGeometry() {
    const { clipPoints } = this.props;
    const points: Vector3[] = [];
    const xs = clipPoints.map(p => p.position.x);
    const ys = clipPoints.map(p => p.position.y);
    const { z } = clipPoints[0].position;

    points.push(new Vector3(Math.min(...xs), Math.max(...ys), z));
    points.push(new Vector3(Math.max(...xs), Math.max(...ys), z));

    points.push(new Vector3(Math.max(...xs), Math.max(...ys), z));
    points.push(new Vector3(Math.max(...xs), Math.min(...ys), z));

    points.push(new Vector3(Math.max(...xs), Math.min(...ys), z));
    points.push(new Vector3(Math.min(...xs), Math.min(...ys), z));

    points.push(new Vector3(Math.min(...xs), Math.min(...ys), z));
    points.push(new Vector3(Math.min(...xs), Math.max(...ys), z));

    this.view.geometry = new BufferGeometry().setFromPoints(points);
    this.view.computeLineDistances();
  }
}
