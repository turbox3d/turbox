import { Box3 } from './Box3';
import { Matrix4 } from './Matrix4';
import { Vector3 } from './Vector3';

const _vector = new Vector3();
const _segCenter = new Vector3();
const _segDir = new Vector3();
const _diff = new Vector3();

class Ray {
  origin: Vector3;
  direction: Vector3;

  constructor(origin?: Vector3, direction?: Vector3) {
    this.origin = (origin !== undefined) ? origin : new Vector3();
    this.direction = (direction !== undefined) ? direction : new Vector3(0, 0, -1);
  }

  set(origin: Vector3, direction: Vector3) {
    this.origin.copy(origin);
    this.direction.copy(direction);

    return this;
  }

  clone() {
    return new Ray().copy(this);
  }

  copy(ray: Ray) {
    this.origin.copy(ray.origin);
    this.direction.copy(ray.direction);

    return this;
  }

  at(t: number, target: Vector3) {
    return target.copy(this.direction).multiplyScalar(t).add(this.origin);
  }

  lookAt(v: Vector3) {
    this.direction.copy(v).sub(this.origin).normalize();

    return this;
  }

  recast(t: number) {
    this.origin.copy(this.at(t, _vector));

    return this;
  }

  closestPointToPoint(point: Vector3, target: Vector3) {
    target.subVectors(point, this.origin);

    const directionDistance = target.dot(this.direction);

    if (directionDistance < 0) {
      return target.copy(this.origin);
    }

    return target.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
  }

  distanceToPoint(point: Vector3) {
    return Math.sqrt(this.distanceSqToPoint(point));
  }

  distanceSqToPoint(point: Vector3) {
    const directionDistance = _vector.subVectors(point, this.origin).dot(this.direction);

    // point behind the ray

    if (directionDistance < 0) {
      return this.origin.distanceToSquared(point);
    }

    _vector.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);

    return _vector.distanceToSquared(point);
  }

  distanceSqToSegment(v0: Vector3, v1: Vector3, optionalPointOnRay?: Vector3, optionalPointOnSegment?: Vector3) {
    // from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteDistRaySegment.h
    // It returns the min distance between the ray and the segment
    // defined by v0 and v1
    // It can also set two optional targets :
    // - The closest point on the ray
    // - The closest point on the segment

    _segCenter.copy(v0).add(v1).multiplyScalar(0.5);
    _segDir.copy(v1).sub(v0).normalize();
    _diff.copy(this.origin).sub(_segCenter);

    const segExtent = v0.distanceTo(v1) * 0.5;
    const a01 = -this.direction.dot(_segDir);
    const b0 = _diff.dot(this.direction);
    const b1 = -_diff.dot(_segDir);
    const c = _diff.lengthSq;
    const det = Math.abs(1 - a01 * a01);
    let s0: number; let s1: number; let sqrDist: number; let extDet: number;

    if (det > 0) {
      // The ray and segment are not parallel.

      s0 = a01 * b1 - b0;
      s1 = a01 * b0 - b1;
      extDet = segExtent * det;

      if (s0 >= 0) {
        if (s1 >= -extDet) {
          if (s1 <= extDet) {
            // region 0
            // Minimum at interior points of ray and segment.

            const invDet = 1 / det;
            s0 *= invDet;
            s1 *= invDet;
            sqrDist = s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c;
          } else {
            // region 1

            s1 = segExtent;
            s0 = Math.max(0, -(a01 * s1 + b0));
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          }
        } else {
          // region 5

          s1 = -segExtent;
          s0 = Math.max(0, -(a01 * s1 + b0));
          sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
        }
      } else if (s1 <= -extDet) {
        // region 4

        s0 = Math.max(0, -(-a01 * segExtent + b0));
        s1 = (s0 > 0) ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
        sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
      } else if (s1 <= extDet) {
        // region 3

        s0 = 0;
        s1 = Math.min(Math.max(-segExtent, -b1), segExtent);
        sqrDist = s1 * (s1 + 2 * b1) + c;
      } else {
        // region 2

        s0 = Math.max(0, -(a01 * segExtent + b0));
        s1 = (s0 > 0) ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
        sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
      }
    } else {
      // Ray and segment are parallel.

      s1 = (a01 > 0) ? -segExtent : segExtent;
      s0 = Math.max(0, -(a01 * s1 + b0));
      sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
    }

    if (optionalPointOnRay) {
      optionalPointOnRay.copy(this.direction).multiplyScalar(s0).add(this.origin);
    }

    if (optionalPointOnSegment) {
      optionalPointOnSegment.copy(_segDir).multiplyScalar(s1).add(_segCenter);
    }

    return sqrDist;
  }

  intersectBox(box: Box3, target: Vector3) {
    let tmin; let tmax; let tymin; let tymax; let tzmin; let
      tzmax;

    const invdirx = 1 / this.direction.x;
    const invdiry = 1 / this.direction.y;
    const invdirz = 1 / this.direction.z;

    const origin = this.origin;

    if (invdirx >= 0) {
      tmin = (box.min.x - origin.x) * invdirx;
      tmax = (box.max.x - origin.x) * invdirx;
    } else {
      tmin = (box.max.x - origin.x) * invdirx;
      tmax = (box.min.x - origin.x) * invdirx;
    }

    if (invdiry >= 0) {
      tymin = (box.min.y - origin.y) * invdiry;
      tymax = (box.max.y - origin.y) * invdiry;
    } else {
      tymin = (box.max.y - origin.y) * invdiry;
      tymax = (box.min.y - origin.y) * invdiry;
    }

    if ((tmin > tymax) || (tymin > tmax)) return null;

    // These lines also handle the case where tmin or tmax is NaN
    // (result of 0 * Infinity). x !== x returns true if x is NaN

    // eslint-disable-next-line no-self-compare
    if (tymin > tmin || tmin !== tmin) tmin = tymin;

    // eslint-disable-next-line no-self-compare
    if (tymax < tmax || tmax !== tmax) tmax = tymax;

    if (invdirz >= 0) {
      tzmin = (box.min.z - origin.z) * invdirz;
      tzmax = (box.max.z - origin.z) * invdirz;
    } else {
      tzmin = (box.max.z - origin.z) * invdirz;
      tzmax = (box.min.z - origin.z) * invdirz;
    }

    if ((tmin > tzmax) || (tzmin > tmax)) return null;

    // eslint-disable-next-line no-self-compare
    if (tzmin > tmin || tmin !== tmin) tmin = tzmin;

    // eslint-disable-next-line no-self-compare
    if (tzmax < tmax || tmax !== tmax) tmax = tzmax;

    // return point closest to the ray (positive side)

    if (tmax < 0) return null;

    return this.at(tmin >= 0 ? tmin : tmax, target);
  }

  intersectsBox(box: Box3) {
    return this.intersectBox(box, _vector) !== null;
  }

  applyMatrix4(matrix4: Matrix4) {
    this.origin.applyMatrix4(matrix4);
    this.direction.transformDirection(matrix4);

    return this;
  }

  equals(ray: Ray) {
    return ray.origin.equals(this.origin) && ray.direction.equals(this.direction);
  }
}

export { Ray };
