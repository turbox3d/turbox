import { MathUtils } from '../MathUtils';
import { Tolerance } from './Tolerance';

export class Interval {
  static invalid(): Interval {
    return new Interval(NaN, NaN);
  }

  /**
   * interval mul by number
   * @param alpha
   * @returns
   */
  static mul(interval: Interval, alpha: number): Interval {
    if (!interval) {
      return Interval.invalid();
    }
    return new Interval(interval.start * alpha, interval.end * alpha);
  }

  /**
   * Get the intersect intervals of two list of intervals.
   * @param intervals1
   * @param intervals2
   * @returns List<Interval>
   */
  static intersect(intervals1: Interval[], intervals2: Interval[]): Interval[] {
    if (!intervals1 || intervals1.length === 0) {
      return [];
    }

    if (!intervals2 || intervals2.length === 0) {
      return [];
    }

    let sortedIntervals1: Interval[] = Interval.union(intervals1);
    let sortedIntervals2: Interval[] = Interval.union(intervals2);
    const resultIntervals: Interval[] = [];

    sortedIntervals1 = sortedIntervals1.sort((n1, n2) => n1.start - n2.start);
    sortedIntervals2 = sortedIntervals2.sort((n1, n2) => n1.start - n2.start);

    let index1 = 0;
    let index2 = 0;
    while (index1 < sortedIntervals1.length && index2 < sortedIntervals2.length) {
      if (sortedIntervals1[index1].intersected(sortedIntervals2[index2], true)) {
        resultIntervals.push(sortedIntervals1[index1].intersection(sortedIntervals2[index2]));
      }
      if (sortedIntervals1[index1].end < sortedIntervals2[index2].end) {
        index1 += 1;
      } else {
        index2 += 1;
      }
    }

    return resultIntervals;
  }

  /**
   * Combine the intervals.Return the list of intervals after unioned
   * @param intervals
   * @returns {Interval[]}
   */
  static union(intervals: Interval[]): Interval[] {
    if (!intervals || intervals.length === 0) {
      return [];
    }
    const sortedIntervals: Interval[] = intervals.sort((n1, n2) => n1.start - n2.start);
    const resultIntervals: Interval[] = [];

    let temp = sortedIntervals[0];
    for (const interval of sortedIntervals) {
      if (!temp.intersected(interval, true)) {
        resultIntervals.push(temp);
        temp = new Interval(interval.start, interval.end);
      } else {
        temp = temp.includeInterval(interval);
      }
    }
    resultIntervals.push(temp);

    return resultIntervals;
  }

  private _start: number;
  private _end: number;

  /**
   * constructor
   * @param start
   * @param end
   */
  constructor(start: number, end: number) {
    this._start = start;
    this._end = end;
  }

  /**
   * Get interval's start
   */
  get start(): number {
    return this._start;
  }

  /**
   * Get interval's end
   */
  get end(): number {
    return this._end;
  }

  /**
   * Returns true if this interval is equal to another within specified tolerance.
   * @param other
   * @param numericTolerance
   * @return
   */
  isEqual(other: Interval, numTol?: number): boolean {
    const tolerance = numTol || Tolerance.global.numTol;
    return (MathUtils.isEqual(this._start, other.start, tolerance)
      && MathUtils.isEqual(this._end, other.end, tolerance));
  }

  /**
   * Get the middle number
   * @return
   */
  get middle(): number {
    return 0.5 * (this._start + this._end);
  }

  /**
   * Get the cloned object of this Interval.
   */
  clone(): Interval {
    return new Interval(this._start, this._end);
  }

  /**
   * Get interval's length
   * @return
   */
  get length(): number {
    return Math.abs(this._end - this._start);
  }

  /**
   * interval string
   * @return
   */
  toString() {
    return `Interval{start: ${this._start}, end: ${this._end}}`;
  }

  /**
   * Indicates whether the Interval is Valid
   * @return
   */
  isValid() {
    return !Number.isNaN(this._start) && !Number.isNaN(this._end);
  }

  /**
   * interval mul by number
   * @param alpha
   * @returns
   */
  mul(alpha: number): Interval {
    return new Interval(this._start * alpha, this._end * alpha);
  }

  /**
   * interval add by number
   * @param alpha
   * @returns
   */
  add(interval: Interval): Interval {
    if (!interval) {
      return new Interval(this._start, this._end);
    }
    return new Interval(this._start + interval.start, this._end + interval.end);
  }

  addByNumber(alpha: number): Interval {
    return new Interval(this._start + alpha, this._end + alpha);
  }

  /**
   * interval sub by Interval
   * @param interval
   * @returns
   */
  sub(interval: Interval): Interval {
    if (!interval) {
      return new Interval(this._start, this._end);
    }
    return new Interval(this._start - interval.start, this._end - interval.end);
  }

  /**
   * Interval interpolate
   * @param alpha
   * @returns
   */
  interpolate(alpha: number): number {
    return (1 - alpha) * this._start + alpha * this._end;
  }

  /**
   * Interval expand
   * @param length
   * @returns
   */
  expand(length: number): Interval {
    return new Interval(this._start - length, this._end + length);
  }

  /**
   * Indicates whether the given value is included in this interval.
   * @param {number} point
   * @param {boolean} includeEnds - Indicates whether to check the ends.
   * @param {number} [tolerance] - Tolerance to check on the ends.
   * @returns {boolean}
   */
  contains(point: number, includeEnds: boolean, tolerance: number = Tolerance.global.distTol): boolean {
    if (includeEnds) {
      return point <= this._end + tolerance && point >= this._start - tolerance;
    }
    return point < this._end - tolerance && point > this._start + tolerance;
  }

  /**
   * Indicates whether the given interval is included in this interval.
   * @param {Interval} interval
   * @param {boolean} includeEnds - Indicates whether to check the ends.
   * @param {number} [tolerance] - Tolerance to check on the ends.
   * @returns {boolean}
   */
  containsInterval(interval: Interval, includeEnds: boolean, tolerance: number = Tolerance.global.distTol): boolean {
    if (includeEnds) {
      return interval._start >= this._start - tolerance && interval._end <= this._end + tolerance;
    }
    return interval._start > this._start + tolerance && interval._end < this._end - tolerance;
  }

  /**
   * Indicates whether the given interval is intersected with this interval.
   * @param {Interval} interval
   * @param {boolean} includeEnds - Indicates whether to check the ends.
   * @param {number} [tolerance] - Intersection tolerance.
   * @returns {boolean}
   */
  intersects(interval: Interval, includeEnds: boolean, tolerance: number = Tolerance.global.distTol): boolean {
    if (includeEnds) {
      return !(this._start > interval._end + tolerance || this._end < interval._start - tolerance);
    }
    return !(this._start >= interval._end - tolerance || this._end <= interval._start + tolerance);
  }

  /**
   * Indicates whether the given interval is intersected with this interval.
   * @param {Interval} interval
   * @param {boolean} includeEnds - Indicates whether to check the ends.
   * @param {number} [tolerance] - Intersection tolerance.
   * @returns {boolean}
   */
  intersected(interval: Interval, includeEnds: boolean, tolerance: number = Tolerance.global.distTol): boolean {
    if (includeEnds) {
      return !(this._start > interval._end + tolerance || this._end < interval._start - tolerance);
    }
    return !(this._start >= interval._end - tolerance || this._end <= interval._start + tolerance);
  }

  /**
   * Get the intersect part with interval. If the intervals are not intersectant, we will return an invalid interval
   * @param interval
   * @returns {Interval} | null
   */
  intersection(interval: Interval): Interval {
    if (!interval || !this.intersected(interval, true)) {
      return Interval.invalid();
    }
    return new Interval(Math.max(interval.start, this.start), Math.min(interval.end,
      this.end));
  }

  /**
   * Combine with interval. If the intervals are not intersectant, we will return an invalid interval
   * @param interval
   * @returns
   */
  includeInterval(interval: Interval): Interval {
    if (!interval || !this.intersected(interval, true)) {
      return Interval.invalid();
    }
    return new Interval(Math.min(interval.start, this.start), Math.max(interval.end,
      this.end));
  }
}
