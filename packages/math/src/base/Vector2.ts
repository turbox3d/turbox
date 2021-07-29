import { MathUtils } from '../MathUtils';
import { Matrix3 } from './Matrix3';
import { Tolerance } from './Tolerance';
import { Vector3 } from './Vector3';

class Vector2 {
  static fromObject(obj: { x: number; y: number }) {
    return new Vector2(obj.x, obj.y);
  }

  readonly isVector2: boolean;
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.isVector2 = true;
    this.x = x;
    this.y = y;
  }

  get width() {
    return this.x;
  }

  set width(value) {
    this.x = value;
  }

  get height() {
    return this.y;
  }

  set height(value) {
    this.y = value;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  setScalar(scalar: number) {
    this.x = scalar;
    this.y = scalar;
    return this;
  }

  setX(x: number) {
    this.x = x;
    return this;
  }

  setY(y: number) {
    this.y = y;
    return this;
  }

  setComponent(index: number, value: number) {
    switch (index) {
    case 0: this.x = value; break;
    case 1: this.y = value; break;
    default: throw new Error(`index is out of range: ${index}`);
    }
    return this;
  }

  getComponent(index: number) {
    switch (index) {
    case 0: return this.x;
    case 1: return this.y;
    default: throw new Error(`index is out of range: ${index}`);
    }
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  copy(v: Vector2) {
    this.x = v.x;
    this.y = v.y;

    return this;
  }

  add(v: Vector2) {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  added(v: Vector2) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  addScalar(s: number) {
    this.x += s;
    this.y += s;

    return this;
  }

  addVectors(a: Vector2, b: Vector2) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;

    return this;
  }

  addScaledVector(v: Vector2, s: number) {
    this.x += v.x * s;
    this.y += v.y * s;

    return this;
  }

  sub(v: Vector2) {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  subtracted(v: Vector2) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  subScalar(s: number) {
    this.x -= s;
    this.y -= s;

    return this;
  }

  subVectors(a: Vector2, b: Vector2) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;

    return this;
  }

  reverse() {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  }

  reversed() {
    return new Vector2(-this.x, -this.y);
  }

  multiply(v: Vector2) {
    this.x *= v.x;
    this.y *= v.y;

    return this;
  }

  /**
   * Return a new vector which is the scaler result of this vector.
   * @param scale
   */
  multiplied(scale: number) {
    return new Vector2(this.x * scale, this.y * scale);
  }

  multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;

    return this;
  }

  divide(v: Vector2) {
    this.x /= v.x;
    this.y /= v.y;

    return this;
  }

  divideScalar(scalar: number) {
    return this.multiplyScalar(1 / scalar);
  }

  applyMatrix3(m: Matrix3) {
    const x = this.x;
    const y = this.y;
    const e = m.elements;

    this.x = e[0] * x + e[3] * y + e[6];
    this.y = e[1] * x + e[4] * y + e[7];

    return this;
  }

  min(v: Vector2) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);

    return this;
  }

  max(v: Vector2) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);

    return this;
  }

  clamp(min: Vector2, max: Vector2) {
    // assumes min < max, componentwise
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));

    return this;
  }

  clampScalar(minVal: number, maxVal: number) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));

    return this;
  }

  clampLength(min: number, max: number) {
    const length = this.length;

    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);

    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);

    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);

    return this;
  }

  roundToZero() {
    this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);

    return this;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  }

  dot(v: Vector2) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector2) {
    return this.x * v.y - this.y * v.x;
  }

  get lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  get manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }

  normalize() {
    return this.divideScalar(this.length || 1);
  }

  /**
   * The angle in [0, PI]
   */
  angle(v?: Vector2) {
    if (!v) {
      return Math.atan2(-this.y, -this.x) + Math.PI;
    }
    return Math.atan2(Math.abs(this.cross(v)), this.dot(v));
  }

  /**
   * The angle in [0, 2PI)
   */
  angleTo(v: Vector2): number {
    const crossed = this.cross(v);
    const angle = this.angle(v);
    const pi2 = Math.PI * 2;

    if (crossed < 0.0 && angle < Math.PI && angle > 0) {
      return pi2 - angle;
    }
    return angle;
  }

  /**
   * 返回单位向量
   */
  normalized() {
    const tol = 1e-16;
    let len = this.lengthSq;
    if (len === 0 || MathUtils.isEqual(len, 1, tol)) {
      return new Vector2(this.x, this.y);
    }
    len = Math.sqrt(len);
    const newX = this.x / len;
    const newY = this.y / len;
    if (!Number.isFinite(newX) || !Number.isFinite(newY)) {
      return new Vector2(this.x, this.y);
    }
    return new Vector2(newX, newY);
  }

  distanceTo(v: Vector2) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v: Vector2) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  manhattanDistanceTo(v: Vector2) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }

  setLength(length: number) {
    return this.normalize().multiplyScalar(length);
  }

  lerp(v: Vector2, alpha: number) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;

    return this;
  }

  lerpVectors(v1: Vector2, v2: Vector2, alpha: number) {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;

    return this;
  }

  equals(v: Vector2, distTol = Tolerance.global.distTol, cosTol = Tolerance.global.cosTol) {
    const sLen0 = this.lengthSq;
    const sLen1 = v.lengthSq;
    if (MathUtils.isZero(sLen0, distTol * distTol) && MathUtils.isZero(sLen1, distTol * distTol)) {
      return true;
    }
    // 向量距离相等并且方向相同
    return MathUtils.isEqual(Math.sqrt(sLen0), Math.sqrt(sLen1), distTol)
      && this.isSameDirection(v, new Tolerance(cosTol, distTol, Tolerance.global.numTol), false);
  }

  isZero(distTol = Tolerance.global.distTol) {
    return this.lengthSq < distTol * distTol;
  }

  /**
   * 是否平行
   */
  isParallel(vec: Vector2, tol?: Tolerance, checkZeroVec = true) {
    const cosTol = tol ? tol.cosTol : Tolerance.global.cosTol;
    const distTol = tol ? tol.distTol : Tolerance.global.distTol;
    const len1 = this.length;
    const len2 = vec.length;

    if (len1 === 0 || len2 === 0 || checkZeroVec &&
      (MathUtils.isZero(len1, distTol) || MathUtils.isZero(len2, distTol))) {
      return false;
    }

    const multiLen = len1 * len2;
    return Math.abs(multiLen - Math.abs(this.dot(vec))) <= cosTol * multiLen;
  }

  /**
   * 是否垂直
   */
  isPerpendicular(vec: Vector2, tol?: Tolerance, checkZeroVec = true) {
    const cosTol = tol ? tol.cosTol : Tolerance.global.cosTol;
    const distTol = tol ? tol.distTol : Tolerance.global.distTol;
    const len1 = this.length;
    const len2 = vec.length;

    if (len1 === 0 || len2 === 0 || checkZeroVec && (MathUtils.isZero(len1, distTol) || MathUtils.isZero(len2, distTol))) {
      return false;
    }

    const multiLen = len1 * len2;
    return Math.abs(multiLen - Math.abs(this.cross(vec))) <= cosTol * multiLen;
  }

  isSameDirection(v: Vector2, tol?: Tolerance, checkZeroVec = true) {
    const cosTol = tol ? tol.cosTol : Tolerance.global.cosTol;
    const distTol = tol ? tol.distTol : Tolerance.global.distTol;
    const len1 = this.length;
    const len2 = v.length;

    if (len1 === 0 || len2 === 0 || checkZeroVec && (MathUtils.isZero(len1, distTol) || MathUtils.isZero(len2, distTol))) {
      return false;
    }

    const multiLen = len1 * len2;
    return Math.abs(multiLen - this.dot(v)) <= cosTol * multiLen;
  }

  isOpposite(vec: Vector2, tol?: Tolerance, checkZeroVec = true): boolean {
    const cosTol = tol ? tol.cosTol : Tolerance.global.cosTol;
    const distTol = tol ? tol.distTol : Tolerance.global.distTol;
    const len1 = this.length;
    const len2 = vec.length;

    if (len1 === 0 || len2 === 0 || checkZeroVec && (MathUtils.isZero(len1, distTol) || MathUtils.isZero(len2, distTol))) {
      return false;
    }

    const multiLen = len1 * len2;
    return Math.abs(multiLen + this.dot(vec)) <= cosTol * multiLen;
  }

  fromArray(array: number[] | ArrayLike<number>, offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];

    return this;
  }

  toArray(array: number[] = [], offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;

    return array;
  }

  toVector3() {
    return new Vector3(this.x, this.y, 0);
  }

  rotateAround(center: Vector2, angle: number) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const x = this.x - center.x;
    const y = this.y - center.y;

    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;

    return this;
  }

  random() {
    this.x = Math.random();
    this.y = Math.random();

    return this;
  }
}

export { Vector2 };
