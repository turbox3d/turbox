import { Reactive } from 'turbox';
import React from 'react';
import { Point } from '../domain/point';
import { cts } from './index';
import Point2d from '../math/Point2d';

interface IProps {
  data: Point;
  index: number;
}

const PointComp: React.FC<IProps> = ({ data, index }) => {
  console.log('***childPoint');
  console.log('index: ', index);
  const updateFirstPointPosition = (index) => () => {
    cts.countertops[0].updatePointByIndex(index, new Point2d(1000, 1000));
  }

  return (
    <React.Fragment>
      <span>position：{data && data.position && JSON.stringify(data.position)}</span>
      <span>prevLine：{data && data.prevLine && JSON.stringify(data.prevLine)}</span>
      <button onClick={updateFirstPointPosition(index)}>point btn</button>
      {/* {cts.countertops[0].info.b && cts.countertops.length && cts.countertops[0].info && cts.countertops[0].info.a &&
        <span>inner: {cts.countertops[0].info.a}</span>
      } */}
    </React.Fragment>
  );
};

export default Reactive(PointComp);
