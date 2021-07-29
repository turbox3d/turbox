import { Vector2 } from './Vector2';
import { Tolerance } from './Tolerance';
import { MathUtils } from '../MathUtils';

const _vector = new Vector2();

class Box2 {
  min: Vector2;
  max: Vector2;
  readonly isBox2: boolean;

  constructor(min?: Vector2, max?: Vector2) {
    this.isBox2 = true;
    this.min = (min !== undefined) ? min : new Vector2(+Infinity, +Infinity);
    this.max = (max !== undefined) ? max : new Vector2(-Infinity, -Infinity);
  }

  set(min: Vector2, max: Vector2) {
    this.min.copy(min);
    this.max.copy(max);

    return this;
  }

  setFromPoints(points: Vector2[]) {
    this.makeEmpty();

    for (let i = 0, il = points.length; i < il; i++) {
      this.expandByPoint(points[i]);
    }

    return this;
  }

  setFromCenterAndSize(center: Vector2, size: Vector2) {
    const halfSize = _vector.copy(size).multiplyScalar(0.5);
    this.min.copy(center).sub(halfSize);
    this.max.copy(center).add(halfSize);

    return this;
  }

  clone() {
    return new Box2().copy(this);
  }

  copy(box: Box2) {
    this.min.copy(box.min);
    this.max.copy(box.max);

    return this;
  }

  makeEmpty() {
    // eslint-disable-next-line no-multi-assign
    this.min.x = this.min.y = +Infinity;
    // eslint-disable-next-line no-multi-assign
    this.max.x = this.max.y = -Infinity;

    return this;
  }

  isEmpty() {
    // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
    return (this.max.x < this.min.x) || (this.max.y < this.min.y);
  }

  equals(box: Box2, distTol = Tolerance.global.distTol) {
    return this.min.equals(box.min, distTol) && this.max.equals(box.max, distTol);
  }

  getCenter(target: Vector2) {
    return this.isEmpty() ? target.set(0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
  }

  getSize(target: Vector2) {
    return this.isEmpty() ? target.set(0, 0) : target.subVectors(this.max, this.min);
  }

  expandByPoint(point: Vector2) {
    this.min.min(point);
    this.max.max(point);

    return this;
  }

  expandByVector(vector: Vector2) {
    this.min.sub(vector);
    this.max.add(vector);

    return this;
  }

  expandByScalar(scalar: number) {
    this.min.addScalar(-scalar);
    this.max.addScalar(scalar);

    return this;
  }

  containsPoint(point: Vector2, distTol = Tolerance.global.distTol) {
    return !(
      MathUtils.isSmaller(point.x, this.min.x, distTol) ||
      MathUtils.isBigger(point.x, this.max.x, distTol) ||
      MathUtils.isSmaller(point.y, this.min.y, distTol) ||
      MathUtils.isBigger(point.y, this.max.y, distTol)
    );
  }

  containsBox(box: Box2, distTol = Tolerance.global.distTol) {
    return MathUtils.isSmallerOrEqual(this.min.x, box.min.x, distTol) &&
      MathUtils.isSmallerOrEqual(box.max.x, this.max.x, distTol) &&
      MathUtils.isSmallerOrEqual(this.min.y, box.min.y, distTol) &&
      MathUtils.isSmallerOrEqual(box.max.y, this.max.y, distTol);
  }

  isValid() {
    return this.min.x <= this.max.x &&
      this.min.y <= this.max.y;
  }

  isOverlapping(box: Box2, distTol = Tolerance.global.distTol) {
    if (!box.isValid()) {
      return false;
    }
    if (MathUtils.isSmaller(this.max.x, box.min.x, distTol) || MathUtils.isBigger(this.min.x, box.max.x, distTol)) {
      return false;
    }
    if (MathUtils.isSmaller(this.max.y, box.min.y, distTol) || MathUtils.isBigger(this.min.y, box.max.y, distTol)) {
      return false;
    }

    return true;
  }

  getParameter(point: Vector2, target: Vector2) {
    // This can potentially have a divide by zero if the box
    // has a size dimension of 0.
    return target.set(
      (point.x - this.min.x) / (this.max.x - this.min.x),
      (point.y - this.min.y) / (this.max.y - this.min.y)
    );
  }

  intersectsBox(box: Box2) {
    // using 4 splitting planes to rule out intersections
    return !(box.max.x < this.min.x || box.min.x > this.max.x ||
      box.max.y < this.min.y || box.min.y > this.max.y);
  }

  clampPoint(point: Vector2, target: Vector2) {
    return target.copy(point).clamp(this.min, this.max);
  }

  distanceToPoint(point: Vector2) {
    const clampedPoint = _vector.copy(point).clamp(this.min, this.max);
    return clampedPoint.sub(point).length;
  }

  intersect(box: Box2) {
    this.min.max(box.min);
    this.max.min(box.max);

    return this;
  }

  union(box: Box2) {
    this.min.min(box.min);
    this.max.max(box.max);

    return this;
  }

  translate(offset: Vector2) {
    this.min.add(offset);
    this.max.add(offset);

    return this;
  }
}

export { Box2 };
