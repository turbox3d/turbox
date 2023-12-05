import * as THREE from 'three';
import Point2d from '../math/Point2d';
import { Domain, mutation, reactor, computed, Action, action } from '@turbox3d/reactivity-react';
import { Line } from './line';
import { Point } from './point';
import { EPointType } from '../types/enum';
import axios from 'axios';

export class Countertop extends Domain {
  @reactor() points: Point[];
  @reactor() normalPoints = [{
    position: {
      isActive: true,
    },
  }, {
    position: {
      isActive: true,
    },
  }, {
    position: {
      isActive: true,
    },
  }];
  @reactor(true, true) lines: Line[];
  @reactor(true, true) info: any = {
    // a: 1,
    b: 'bbb',
  };
  @reactor() firstName = 'Jack';
  @reactor() lastName = 'Ma';
  @reactor(true, true) nickName = '';
  @reactor() threeVector = new THREE.Vector3(1, 1, 1);
  @reactor() myMap: Map<number, number> = new Map([[0, 0], [2, 2]]);
  @reactor() mySet: Set<number> = new Set([0, 1, 2]);

  initDomainContext() {
    return {
      isNeedRecord: true,
    };
  }

  get _firstName() {
    return this.firstName;
  }

  @computed({
    lazy: false,
  })
  get fullName() {
    console.log('***rere-computed***');
    return this._firstName + ' ' + this.lastName;
  }
  set fullName(value: string) {
    const [firstName, lastName] = value.split(' ');
    this.firstName = firstName;
    this.lastName = lastName;
  }

  // getFullName = () => {
  //   console.log('***re-computed***');
  //   return this.firstName + ' ' + this.lastName;
  // }
  @mutation
  updateNickName(value: string) {
    this.nickName += value;
  }

  @mutation
  doThreeOp() {
    this.threeVector.setLength(200);
    console.log(this.threeVector);
  }

  @mutation
  doMapOp() {
    // this.myMap.set(0, 1000);
    this.myMap.set(1, 1);
    // this.myMap.delete(0);
    // this.myMap.clear();
  }

  @mutation
  doSetOp() {
    // this.mySet.delete(1);
    // this.mySet.clear();
    // this.mySet.add(1);
    this.mySet.add(1000);
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
    this.info.a = 1;
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

  @mutation()
  updatePointByIndex(index, position) {
    this.normalPoints[index].position.isActive = position;
  }

  @mutation()
  updatePointsByIndex(index, position) {
    this.points[index].position = position;
  }

  @mutation('添加点')
  addPoint = (point: Point) => {
    this.points.push(point);
    // this.fullName = 'Geoff Gu';
    // this.linkPointsAndLines();
  }

  @mutation('删除点')
  removePoint(index) {
    this.points.splice(index, 1);
  }

  delay = (time: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(undefined);
      }, time);
    });
  }

  // @effect('')
  // async testTwoEffect(action: Action, p: Point, l: Line) {
  //   console.log(action);
  //   this.testEffect(p, l);
  //   this.testEffect(p, l);
  // }

  @mutation('测试异步mutation')
  async testTwoMutation(p: Point, l: Line) {
    this.addPoint(p);
    // await this.delay(2000);
    // this.addPoint(p);
    // return 'aaa';
    // await axios.get('dasdasd');
    await this.inner(p, l);
    // await this.inner(p, l);
  }

  @mutation('测试异步mutation')
  async inner(p: Point, l: Line) {
    this.addPoint(p);
    await this.delay(2000);
    this.addPoint(p);
    return 'aaa';
  }

  async ttt(p: Point, l: Line) {
    this.addPoint(p);
    this.addPoint(p);
    const t = await this.testTwoMutation(p, l);
    console.log('@@@@@@@', t);
    this.addPoint(p);
    this.addPoint(p);
    await this.delay(2000);
    this.addPoint(p);
    this.addPoint(p);
  }

  // @effect('测试effect')
  // testEffect = async (action: Action, p: Point, l: Line) => {
  //   console.log(action);
  //   action.execute(() => {
  //     this.addPoint(p);
  //   });
  //   await this.delay(2000);
  //   action.execute(() => {
  //     this.addLine(l);
  //   });
  // }

  @mutation('添加线')
  addLine(line: Line) {
    this.lines.push(line);
  }

  @action
  testActionDeco = (a, b, c) => {
    console.log(a, b, c);
    this.updateNickName('feifan gu');
  }

  constructor({
    lines,
    points,
    nickName,
  }: {
    lines: Line[],
    points: Point[],
    nickName: string,
  }) {
    super();
    this.points = points;
    this.lines = lines;
    this.nickName = nickName;
    this.linkPointsAndLines();
  }
}
