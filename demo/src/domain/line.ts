import { Domain, reactor } from '@turboo/turbox';
import { Countertop } from './countertop';
import { Point } from './point';

export class Line extends Domain {
  @reactor start: Point;
  @reactor end: Point;
  @reactor countertop?: Countertop;

  constructor({
    start,
    end,
    countertop,
  }: {
    start: Point,
    end: Point,
    countertop?: Countertop;
  }) {
    super();
    this.start = start;
    this.end = end;
    this.countertop = countertop;
  }
}
