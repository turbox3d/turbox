import Point2d from '../math/Point2d';
import { Domain, effect, mutation, reactor, computed } from 'turbox';
import { Line } from './line';
import { Point } from './point';
import { EPointType } from '../types/enum';

export class Countertop extends Domain {
  @reactor(true) points: Point[];
  @reactor(true, true) lines: Line[];
  @reactor(true, true) info: any = {
    a: 1,
    b: 'bbb',
  };
  @reactor() firstName = 'Jack';
  @reactor() lastName = 'Ma';

  initDomainContext() {
    return {
      isNeedRecord: false,
    };
  }

  @computed()
  get fullName() {
    console.log('***rere-computed***');
    return this.firstName + ' ' + this.lastName;
  }

  getFullName = () => {
    console.log('***re-computed***');
    return this.firstName + ' ' + this.lastName;
  }

  isClosedPath() {
    return this.lines.length === this.points.length;
  }

  // @mutation
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

  @mutation('测试加key')
  addKey() {
    this.info.a += 1;
  }

  @mutation('测试删key')
  removeKey() {
    delete this.info.b;
  }

  @mutation('更新第一个点')
  updateFirstPointPosition() {
    this.points[0].position = new Point2d(-1, -1);
    // this.testEffect(new Point({
    //   position: new Point2d(100, 100),
    //   type: EPointType.NONE,
    // }), new Line({
    //   start: new Point({
    //     position: new Point2d(200, 200),
    //     type: EPointType.NONE,
    //   }),
    //   end: new Point({
    //     position: new Point2d(200, 200),
    //     type: EPointType.NONE,
    //   }),
    // }));
    // this.addPoint(new Point({
    //   position: new Point2d(100, 100),
    //   type: EPointType.NONE,
    // }));
  }

  @mutation('添加点')
  addPoint(point: Point) {
    this.points.push(point);
    // this.linkPointsAndLines();
  }

  @mutation('删除点')
  removePoint(index) {
    this.points.splice(index, 1);
  }

  delay = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  @effect('')
  async testTwoEffect(p: Point, l: Line) {
    this.testEffect(p, l);
    this.testEffect(p, l);
  }

  @mutation()
  testTwoMutation(p: Point, l: Line) {
    this.addPoint(p);
    this.addLine(l);
  }

  @effect('测试effect')
  async testEffect(p: Point, l: Line) {
    this.addPoint(p);
    await this.delay();
    this.addLine(l);
  }

  @mutation('添加线')
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
