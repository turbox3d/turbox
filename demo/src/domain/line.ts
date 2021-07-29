import { Domain, reactor } from '@turbox3d/reactivity-react';
import { Countertop } from './countertop';
import { Point } from './point';

export class Line extends Domain {
  @reactor start: Point;
  @reactor end: Point;
  @reactor length: number;
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
    this.length = 10;
  }
}
