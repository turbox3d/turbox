import Point2d from '../math/Point2d';
import { Domain, mutation, reactor } from '@turbox3d/reactivity-react';
import { Countertop } from './countertop';
import { Line } from './line';
import { EPointType } from '../types/enum';

export class Point extends Domain {
  @reactor(true, true, function(target, property) {
    // console.log('$$$$$', target, property);
    // console.log(this);
  }) position: Point2d;
  @reactor type: EPointType;
  @reactor prevLine?: Line;
  @reactor nextLine?: Line;
  @reactor countertop?: Countertop;

  @mutation('更新点位置')
  updatePosition = (p: Point2d) => {
    this.position = p;
  }

  @mutation('更新点x位置')
  updatePositionX = () => {
    this.position.x = 1000;
  }

  constructor({
    position,
    type,
  }: {
    position: Point2d,
    type: EPointType,
    prevLine?: Line;
    nextLine?: Line;
    countertop?: Countertop;
  }) {
    super();
    this.position = position;
    this.type = type;
  }
}
