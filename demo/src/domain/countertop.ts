import Point2d from '../math/Point2d';
import { Domain, effect, mutation, reactor } from '@turboo/turbox';
import { Line } from './line';
import { Point } from './point';

export class Countertop extends Domain {
  @reactor points: Point[];
  @reactor lines: Line[];

  isClosedPath() {
    return this.lines.length === this.points.length;
  }

  @mutation
  linkPointsAndLines = () => {
    this.lines.forEach((line, index) => {
      const startPoint = this.points[index];
      let endPoint;

      if (index === this.lines.length - 1 && this.isClosedPath()) {
        endPoint = this.points[0];
      } else {
        endPoint = this.points[index + 1];
      }

      line.countertop = this;
      startPoint.countertop = this;
      endPoint.countertop = this;

      startPoint.nextLine = line;
      endPoint.prevLine = line;

      line.start = startPoint;
      line.end = endPoint;
    });
  }

  @mutation
  updateFirstPointPosition() {
    this.points[0].position = new Point2d(-1, -1);
  }

  @mutation
  addPoint(point: Point) {
    this.points.push(point);
  }

  delay = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  @effect
  async testEffect(p: Point, l: Line) {
    this.addPoint(p);
    await this.delay();
    this.addLine(l);
  }

  @mutation
  addLine(line: Line) {
    this.lines.push(line);
  }

  constructor({
    lines,
    points,
  }: {
    lines: Line[],
    points: Point[],
  }) {
    super();
    this.points = points;
    this.lines = lines;
    this.linkPointsAndLines();
  }
}
