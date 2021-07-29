import { Vector3 } from './Vector3';
import { MathUtils } from '../MathUtils';
import { Matrix4 } from './Matrix4';

const _startP = new Vector3();
const _startEnd = new Vector3();

class Line3 {
  start: Vector3;
  end: Vector3;

  constructor(start?: Vector3, end?: Vector3) {
    this.start = (start !== undefined) ? start : new Vector3();
    this.end = (end !== undefined) ? end : new Vector3();
  }

  set(start: Vector3, end: Vector3) {
    this.start.copy(start);
    this.end.copy(end);

    return this;
  }

  clone() {
    return new Line3().copy(this);
  }

  copy(line: Line3) {
    this.start.copy(line.start);
    this.end.copy(line.end);

    return this;
  }

  getCenter(target: Vector3) {
    return target.addVectors(this.start, this.end).multiplyScalar(0.5);
  }

  delta(target: Vector3) {
    return target.subVectors(this.end, this.start);
  }

  distanceSq() {
    return this.start.distanceToSquared(this.end);
  }

  distance() {
    return this.start.distanceTo(this.end);
  }

  at(t: number, target: Vector3) {
    return this.delta(target).multiplyScalar(t).add(this.start);
  }

  closestPointToPointParameter(point: Vector3, clampToLine?: boolean) {
    _startP.subVectors(point, this.start);
    _startEnd.subVectors(this.end, this.start);

    const startEnd2 = _startEnd.dot(_startEnd);
    const startEndStartP = _startEnd.dot(_startP);

    let t = startEndStartP / startEnd2;

    if (clampToLine) {
      t = MathUtils.clamp(t, 0, 1);
    }

    return t;
  }

  closestPointToPoint(point: Vector3, clampToLine: boolean, target: Vector3) {
    const t = this.closestPointToPointParameter(point, clampToLine);
    return this.delta(target).multiplyScalar(t).add(this.start);
  }

  applyMatrix4(matrix: Matrix4) {
    this.start.applyMatrix4(matrix);
    this.end.applyMatrix4(matrix);

    return this;
  }

  equals(line: Line3) {
    return line.start.equals(this.start) && line.end.equals(this.end);
  }
}

export { Line3 };
