/* eslint-disable camelcase */
import { Quaternion } from './base/Quaternion';
import { Tolerance } from './base/Tolerance';
import { Vector3 } from './base/Vector3';

const _lut: string[] = [];

for (let i = 0; i < 256; i++) {
  _lut[i] = (i < 16 ? '0' : '') + i.toString(16);
}

let _seed = 1234567;

const MathUtils = {
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,
  generateUUID() {
    // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
    const d0 = (Math.random() * 0xffffffff) | 0;
    const d1 = (Math.random() * 0xffffffff) | 0;
    const d2 = (Math.random() * 0xffffffff) | 0;
    const d3 = (Math.random() * 0xffffffff) | 0;
    const uuid = `${_lut[d0 & 0xff] + _lut[(d0 >> 8) & 0xff] + _lut[(d0 >> 16) & 0xff] + _lut[(d0 >> 24) & 0xff]}-${
      _lut[d1 & 0xff]
    }${_lut[(d1 >> 8) & 0xff]}-${_lut[((d1 >> 16) & 0x0f) | 0x40]}${_lut[(d1 >> 24) & 0xff]}-${
      _lut[(d2 & 0x3f) | 0x80]
    }${_lut[(d2 >> 8) & 0xff]}-${_lut[(d2 >> 16) & 0xff]}${_lut[(d2 >> 24) & 0xff]}${_lut[d3 & 0xff]}${
      _lut[(d3 >> 8) & 0xff]
    }${_lut[(d3 >> 16) & 0xff]}${_lut[(d3 >> 24) & 0xff]}`;

    // .toUpperCase() here flattens concatenated strings to save heap memory space.
    return uuid.toUpperCase();
  },
  clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  },
  // compute euclidian modulo of m % n
  // https://en.wikipedia.org/wiki/Modulo_operation
  euclideanModulo(n: number, m: number) {
    return ((n % m) + m) % m;
  },
  // Linear mapping from range <a1, a2> to range <b1, b2>
  mapLinear(x: number, a1: number, a2: number, b1: number, b2: number) {
    return b1 + ((x - a1) * (b2 - b1)) / (a2 - a1);
  },
  // https://en.wikipedia.org/wiki/Linear_interpolation
  lerp(x: number, y: number, t: number) {
    return (1 - t) * x + t * y;
  },
  // http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
  damp(x: number, y: number, lambda: number, dt: number) {
    return MathUtils.lerp(x, y, 1 - Math.exp(-lambda * dt));
  },
  // https://www.desmos.com/calculator/vcsjnyz7x4
  pingpong(x: number, length = 1) {
    return length - Math.abs(MathUtils.euclideanModulo(x, length * 2) - length);
  },
  // http://en.wikipedia.org/wiki/Smoothstep
  smoothstep(x: number, min: number, max: number) {
    if (x <= min) return 0;
    if (x >= max) return 1;

    x = (x - min) / (max - min);

    return x * x * (3 - 2 * x);
  },
  smootherstep(x: number, min: number, max: number) {
    if (x <= min) return 0;
    if (x >= max) return 1;

    x = (x - min) / (max - min);

    return x * x * x * (x * (x * 6 - 15) + 10);
  },
  // Random integer from <low, high> interval
  randInt(low: number, high: number) {
    return low + Math.floor(Math.random() * (high - low + 1));
  },
  // Random float from <low, high> interval
  randFloat(low: number, high: number) {
    return low + Math.random() * (high - low);
  },
  // Random float from <-range/2, range/2> interval
  randFloatSpread(range: number) {
    return range * (0.5 - Math.random());
  },
  // Deterministic pseudo-random float in the interval [ 0, 1 ]
  seededRandom(s: number) {
    if (s !== undefined) _seed = s % 2147483647;

    // Park-Miller algorithm

    _seed = (_seed * 16807) % 2147483647;

    return (_seed - 1) / 2147483646;
  },
  degToRad(degrees: number) {
    return degrees * MathUtils.DEG2RAD;
  },
  radToDeg(radians: number) {
    return radians * MathUtils.RAD2DEG;
  },
  isPowerOfTwo(value: number) {
    return (value & (value - 1)) === 0 && value !== 0;
  },
  ceilPowerOfTwo(value: number) {
    return 2 ** Math.ceil(Math.log(value) / Math.LN2);
  },
  floorPowerOfTwo(value: number) {
    return 2 ** Math.floor(Math.log(value) / Math.LN2);
  },
  setQuaternionFromProperEuler(q: Quaternion, a: number, b: number, c: number, order: string) {
    // Intrinsic Proper Euler Angles - see https://en.wikipedia.org/wiki/Euler_angles

    // rotations are applied to the axes in the order specified by 'order'
    // rotation by angle 'a' is applied first, then by angle 'b', then by angle 'c'
    // angles are in radians

    const cos = Math.cos;
    const sin = Math.sin;

    const c2 = cos(b / 2);
    const s2 = sin(b / 2);

    const c13 = cos((a + c) / 2);
    const s13 = sin((a + c) / 2);

    const c1_3 = cos((a - c) / 2);
    const s1_3 = sin((a - c) / 2);

    const c3_1 = cos((c - a) / 2);
    const s3_1 = sin((c - a) / 2);

    switch (order) {
    case 'XYX':
      q.set(c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13);
      break;

    case 'YZY':
      q.set(s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13);
      break;

    case 'ZXZ':
      q.set(s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13);
      break;

    case 'XZX':
      q.set(c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13);
      break;

    case 'YXY':
      q.set(s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13);
      break;

    case 'ZYZ':
      q.set(s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13);
      break;

    default:
      console.warn(`THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: ${order}`);
    }
  },
  isEqual(num1: number, num2: number, tol?: number) {
    const tolerance = tol || Tolerance.global.numTol;
    if (num1 === num2) {
      return true;
    }
    return Math.abs(num1 - num2) <= tolerance;
  },
  isZero(num: number, tol?: number) {
    return MathUtils.isEqual(num, 0, tol);
  },
  /**
   * Check wether num1 is smaller than num2 with specified tolerance.
   * Global (default) tolerance will be used if tol is not provided.
   * @param num1
   * @param num2
   * @param tol
   */
  isSmaller(num1: number, num2: number, tol?: number) {
    const tolerance = tol || Tolerance.global.numTol;
    const diff = num1 - num2;
    return diff < -tolerance;
  },
  /**
   * Check whether num1 is bigger than num2 with specified tolerance.
   * Global (default) tolerance will be used if tol is not provided.
   * @param num1
   * @param num2
   * @param tol
   */
  isBigger(num1: number, num2: number, tol?: number) {
    const tolerance = tol || Tolerance.global.numTol;
    const diff = num1 - num2;
    return diff > tolerance;
  },
  /**
   * Check whether num1 is smaller than or equal to num2 with specified tolerance.
   * Global (default) tolerance will be used if tol is not provided.
   * @param num1
   * @param num2
   * @param tol
   */
  isSmallerOrEqual(num1: number, num2: number, tol?: number) {
    const tolerance = tol || Tolerance.global.numTol;
    const diff = num1 - num2;
    return diff <= tolerance;
  },
  /**
   * Check whether num1 is bigger than or equal to num2 with specified tolerance.
   * Global (default) tolerance will be used if tol is not provided.
   * @param num1
   * @param num2
   * @param tol
   */
  isBiggerOrEqual(num1: number, num2: number, tol?: number) {
    const tolerance = tol || Tolerance.global.numTol;
    const diff = num1 - num2;
    return diff >= -tolerance;
  },
  /**
   * Check whether a number is in a range with specified tolerance.
   * Global (default) tolerance will be used if tol is not provided.
   * @param value the value to be checked.
   * @param min the range's lower limit.
   * @param max the range's upper limit.
   * @param minOpen whether the range's lower limit is open, default is false.
   * @param maxOpen whether the range's upper limit is open, default is false.
   * @param tol
   */
  isInRange(value: number, min: number, max: number, minOpen?: boolean, maxOpen?: boolean, tol?: number) {
    const tolerance = tol || Tolerance.global.numTol;
    const diffMin = value - min;
    const diffMax = value - max;
    const biggerMin = minOpen ? diffMin > tolerance : diffMin >= -tolerance;
    const smallerMax = maxOpen ? diffMax < -tolerance : diffMax <= tolerance;
    return biggerMin && smallerMax;
  },
  /**
   * Compare two numbers:
   * If num1 is fuzzy equal to num2, return 0.
   * If num1 is fuzzy bigger than num2, return 1.
   * If num1 is fuzzy smaller than num2, return -1.
   * If num1 or num2 is a NaN, throw exception.
   * @param num1
   * @param num2
   * @param tol
   */
  compare(num1: number, num2: number, tol?: number): -1 | 0 | 1 {
    if (Number.isNaN(num1) || Number.isNaN(num2)) {
      throw Error('Invalid NaN number');
    }

    if (MathUtils.isEqual(num1, num2, tol)) {
      return 0;
    }
    if (num1 < num2) {
      return -1;
    }
    return 1;
  },
  /**
   * 单向线性插值
   */
  interpolation(start: Vector3, end: Vector3, segments = 10) {
    const v = end.subtracted(start);
    const step = v.length / segments;
    const points: Vector3[] = [];
    const n = v.normalized();
    for (let index = 0; index < segments - 1; index++) {
      points.push(start.added(n.clone().multiplyScalar(step * (index + 1))));
    }
    points.unshift(start.clone());
    points.push(end.clone());
    return points;
  },
  /**
   * 根据四方点生成网格
   * @param quadPositions 四方点，左上角为起点，按照顺时针顺序
   * @param widthSegments 宽度分割段数
   * @param heightSegments 高度分割段数
   */
  generateMeshByQuad(quadPositions: Vector3[], widthSegments = 10, heightSegments = 10) {
    const indices: number[] = [];
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const a1 = MathUtils.interpolation(quadPositions[0], quadPositions[1], widthSegments);
    const a2 = MathUtils.interpolation(quadPositions[3], quadPositions[2], widthSegments);
    const a3 = a1.map((v, i) => MathUtils.interpolation(v.clone(), a2[i].clone(), heightSegments));

    for (let i = 0; i <= heightSegments; i++) {
      if (i === 0) {
        vertices.push(...a1.flatMap(a => a.toArray()));
      } else if (i === heightSegments) {
        vertices.push(...a2.flatMap(a => a.toArray()));
      } else {
        vertices.push(...a3.flatMap(a => a[i].toArray()));
      }
      for (let j = 0; j <= widthSegments; j++) {
        normals.push(0, 0, 1);
        uvs.push(j * (1 / widthSegments), i * (1 / heightSegments));
      }
    }
    for (let i = 0; i < heightSegments; i++) {
      for (let j = 0; j < widthSegments; j++) {
        const a = i * (widthSegments + 1) + (j + 1);
        const b = i * (widthSegments + 1) + j;
        const c = (i + 1) * (widthSegments + 1) + j;
        const d = (i + 1) * (widthSegments + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    return {
      indices,
      vertices,
      normals,
      uvs,
    };
  },
};

export { MathUtils };
