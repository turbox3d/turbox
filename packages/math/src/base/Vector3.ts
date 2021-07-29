import { Euler } from './Euler';
import { MathUtils } from '../MathUtils';
import { Matrix3 } from './Matrix3';
import { Matrix4 } from './Matrix4';
import { Quaternion } from './Quaternion';
import { Tolerance } from './Tolerance';
import { Vector2 } from './Vector2';

const _quaternion = new Quaternion();

class Vector3 {
  static fromObject(obj: { x: number; y: number; z?: number }) {
    return new Vector3(obj.x, obj.y, obj.z);
  }

  readonly isVector3: boolean;
  x: number;
  y: number;
  z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.isVector3 = true;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x: number, y: number, z: number) {
    if (z === undefined) z = this.z; // sprite.scale.set(x,y)

    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  setScalar(scalar: number) {
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;

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

  setZ(z: number) {
    this.z = z;

    return this;
  }

  setComponent(index: number, value: number) {
    switch (index) {
    case 0: this.x = value; break;
    case 1: this.y = value; break;
    case 2: this.z = value; break;
    default: throw new Error(`index is out of range: ${index}`);
    }

    return this;
  }

  getComponent(index: number) {
    switch (index) {
    case 0: return this.x;
    case 1: return this.y;
    case 2: return this.z;
    default: throw new Error(`index is out of range: ${index}`);
    }
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;

    return this;
  }

  add(v: Vector3) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;
  }

  added(v: Vector3) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  addScalar(s: number) {
    this.x += s;
    this.y += s;
    this.z += s;

    return this;
  }

  addVectors(a: Vector3, b: Vector3) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;

    return this;
  }

  addScaledVector(v: Vector3, s: number) {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;

    return this;
  }

  sub(v: Vector3) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;
  }

  subtracted(v: Vector3) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  subScalar(s: number) {
    this.x -= s;
    this.y -= s;
    this.z -= s;

    return this;
  }

  subVectors(a: Vector3, b: Vector3) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;

    return this;
  }

  multiply(v: Vector3) {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;

    return this;
  }

  multiplied(v: Vector3) {
    return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
  }

  multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;

    return this;
  }

  multiplyVectors(a: Vector3, b: Vector3) {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;

    return this;
  }

  applyEuler(euler: Euler) {
    return this.applyQuaternion(_quaternion.setFromEuler(euler));
  }

  appliedEuler(euler: Euler) {
    return this.appliedQuaternion(_quaternion.setFromEuler(euler));
  }

  applyAxisAngle(axis: Vector3, angle: number) {
    return this.applyQuaternion(_quaternion.setFromAxisAngle(axis, angle));
  }

  applyMatrix3(m: Matrix3) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const e = m.elements;

    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;

    return this;
  }

  applyNormalMatrix(m: Matrix3) {
    return this.applyMatrix3(m).normalize();
  }

  applyMatrix4(m: Matrix4) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const e = m.elements;
    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

    return this;
  }

  appliedMatrix4(m: Matrix4) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const e = m.elements;
    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

    const newX = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    const newY = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    const newZ = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

    // NOTE: translation has no effect on vector.
    return new Vector3(newX - e[12] * w, newY - e[13] * w, newZ - e[14] * w);
  }

  applyQuaternion(q: Quaternion) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const qx = q.x;
    const qy = q.y;
    const qz = q.z;
    const qw = q.w;

    // calculate quat * vector

    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat

    this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return this;
  }

  appliedQuaternion(q: Quaternion) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const qx = q.x;
    const qy = q.y;
    const qz = q.z;
    const qw = q.w;

    // calculate quat * vector

    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat

    const newX = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    const newY = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    const newZ = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return new Vector3(newX, newY, newZ);
  }

  transformDirection(m: Matrix4) {
    // input: THREE.Matrix4 affine matrix
    // vector interpreted as a direction

    const x = this.x; const y = this.y; const
      z = this.z;
    const e = m.elements;

    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;

    return this.normalize();
  }

  divide(v: Vector3) {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;

    return this;
  }

  divideScalar(scalar: number) {
    return this.multiplyScalar(1 / scalar);
  }

  min(v: Vector3) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);

    return this;
  }

  max(v: Vector3) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);

    return this;
  }

  clamp(min: Vector3, max: Vector3) {
    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));

    return this;
  }

  clampScalar(minVal: number, maxVal: number) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));
    this.z = Math.max(minVal, Math.min(maxVal, this.z));

    return this;
  }

  clampLength(min: number, max: number) {
    const length = this.length;

    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);

    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);

    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);

    return this;
  }

  roundToZero() {
    this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);

    return this;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
  }

  dot(v: Vector3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  // TODO lengthSquared?

  get lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  get manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }

  normalize() {
    return this.divideScalar(this.length || 1);
  }

  normalized() {
    const tol = 1e-16;
    let length = this.lengthSq;
    if (length === 0 || MathUtils.isEqual(length, 1, tol)) {
      return new Vector3(this.x, this.y, this.z);
    }
    length = Math.sqrt(length);
    const newX = this.x / length;
    const newY = this.y / length;
    const newZ = this.z / length;
    if (!Number.isFinite(newX) || !Number.isFinite(newY) || !Number.isFinite(newZ)) {
      return new Vector3(this.x, this.y, this.z);
    }
    return new Vector3(newX, newY, newZ);
  }

  reverse() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
  }

  reversed() {
    return new Vector3(-this.x, -this.y, -this.z);
  }

  setLength(length: number) {
    return this.normalize().multiplyScalar(length);
  }

  lerp(v: Vector3, alpha: number) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;

    return this;
  }

  lerpVectors(v1: Vector3, v2: Vector3, alpha: number) {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;
    this.z = v1.z + (v2.z - v1.z) * alpha;

    return this;
  }

  toVector2() {
    return new Vector2(this.x, this.y);
  }

  cross(v: Vector3) {
    return this.crossVectors(this, v);
  }

  crossed(vec: Vector3) {
    return new Vector3(
      this.y * vec.z - this.z * vec.y,
      this.z * vec.x - this.x * vec.z,
      this.x * vec.y - this.y * vec.x
    );
  }

  crossVectors(a: Vector3, b: Vector3) {
    const ax = a.x; const ay = a.y; const
      az = a.z;
    const bx = b.x; const by = b.y; const
      bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  }

  projectOnVector(v: Vector3) {
    const denominator = v.lengthSq;

    if (denominator === 0) return this.set(0, 0, 0);

    const scalar = v.dot(this) / denominator;

    return this.copy(v).multiplyScalar(scalar);
  }

  projectOnPlane(planeNormal: Vector3) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    _vector.copy(this).projectOnVector(planeNormal);

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return this.sub(_vector);
  }

  reflect(normal: Vector3) {
    // reflect incident vector off plane orthogonal to normal
    // normal is assumed to have unit length

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));
  }

  /**
   * The angle in [0, PI]
   */
  angle(v: Vector3) {
    return Math.atan2(this.crossed(v).length, this.dot(v));
  }

  /**
   * The angle in [0, 2PI)
   */
  angleTo(v: Vector3, vecRef: Vector3) {
    const crossed = this.crossed(v);
    const angle = this.angle(v);
    const pi2 = Math.PI * 2;

    if (crossed.dot(vecRef) < 0.0 && angle < Math.PI && angle > 0) {
      return pi2 - angle;
    }
    return angle;
  }

  distanceTo(v: Vector3) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v: Vector3) {
    const dx = this.x - v.x; const dy = this.y - v.y; const
      dz = this.z - v.z;

    return dx * dx + dy * dy + dz * dz;
  }

  manhattanDistanceTo(v: Vector3) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
  }

  setFromMatrixPosition(m: Matrix4) {
    const e = m.elements;

    this.x = e[12];
    this.y = e[13];
    this.z = e[14];

    return this;
  }

  setFromMatrixScale(m: Matrix4) {
    const sx = this.setFromMatrixColumn(m, 0).length;
    const sy = this.setFromMatrixColumn(m, 1).length;
    const sz = this.setFromMatrixColumn(m, 2).length;

    this.x = sx;
    this.y = sy;
    this.z = sz;

    return this;
  }

  setFromMatrixColumn(m: Matrix4, index: number) {
    return this.fromArray(m.elements, index * 4);
  }

  setFromMatrix3Column(m: Matrix3, index: number) {
    return this.fromArray(m.elements, index * 3);
  }

  equals(v: Vector3, distTol = Tolerance.global.distTol, cosTol = Tolerance.global.cosTol) {
    const sLen0 = this.lengthSq;
    const sLen1 = v.lengthSq;
    if (MathUtils.isZero(sLen0, distTol * distTol) && MathUtils.isZero(sLen1, distTol * distTol)) {
      return true;
    }
    // 向量距离相等并且方向相同
    return MathUtils.isEqual(Math.sqrt(sLen0), Math.sqrt(sLen1), distTol)
      && this.isSameDirection(v, new Tolerance(cosTol, distTol, Tolerance.global.numTol), false);
  }

  isPerpendicular(vec: Vector3, tol?: Tolerance, checkZeroVec = true) {
    const cosTol = tol ? tol.cosTol : Tolerance.global.cosTol;
    const distTol = tol ? tol.distTol : Tolerance.global.distTol;
    const len1 = this.length;
    const len2 = vec.length;

    if (len1 === 0 || len2 === 0 || checkZeroVec && (MathUtils.isZero(len1, distTol) || MathUtils.isZero(len2, distTol))) {
      return false;
    }

    const multiLen = len1 * len2;
    // eslint-disable-next-line no-restricted-properties
    return this.cross(vec).lengthSq >= Math.pow(multiLen - cosTol * multiLen, 2);
  }

  isParallel(vec: Vector3, tol?: Tolerance, checkZeroVec = true) {
    const cosTol = tol ? tol.cosTol : Tolerance.global.cosTol;
    const distTol = tol ? tol.distTol : Tolerance.global.distTol;
    const len1 = this.length;
    const len2 = vec.length;

    if (len1 === 0 || len2 === 0 || checkZeroVec && (MathUtils.isZero(len1, distTol) || MathUtils.isZero(len2, distTol))) {
      return false;
    }

    const multiLen = len1 * len2;
    return Math.abs(multiLen - Math.abs(this.dot(vec))) <= cosTol * multiLen;
  }

  isSameDirection(vec: Vector3, tol?: Tolerance, checkZeroVec = true) {
    const cosTol = tol ? tol.cosTol : Tolerance.global.cosTol;
    const distTol = tol ? tol.distTol : Tolerance.global.distTol;
    const len1 = this.length;
    const len2 = vec.length;

    if (len1 === 0 || len2 === 0 || checkZeroVec && (MathUtils.isZero(len1, distTol) || MathUtils.isZero(len2, distTol))) {
      return false;
    }

    const multiLen = len1 * len2;
    return Math.abs(multiLen - this.dot(vec)) <= cosTol * multiLen;
  }

  isOpposite(vec: Vector3, tol?: Tolerance, checkZeroVec = true) {
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

  isZero(distTol = Tolerance.global.distTol) {
    return this.lengthSq < distTol * distTol;
  }

  fromArray(array: number[] | ArrayLike<number>, offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];

    return this;
  }

  toArray(array: number[] = [], offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;

    return array;
  }

  random() {
    this.x = Math.random();
    this.y = Math.random();
    this.z = Math.random();

    return this;
  }
}

const _vector = new Vector3();

export { Vector3 };
