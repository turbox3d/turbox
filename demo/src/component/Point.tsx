import { Reactive } from 'turbox';
import React from 'react';
import { Point } from '../domain/point';
import { cts } from './index';

interface IProps {
  data: Point;
  index: number;
}

const PointComp: React.FC<IProps> = ({ data, index }) => {
  console.log('***childPoint');
  console.log('index: ', index);

  return (
    <React.Fragment>
      <span>position：{data && data.position && JSON.stringify(data.position)}</span>
      <span>prevLine：{data && data.prevLine && JSON.stringify(data.prevLine)}</span>
      {cts.countertops[0].info.b && cts.countertops.length && cts.countertops[0].info && cts.countertops[0].info.a &&
        <span>inner: {cts.countertops[0].info.a}</span>
      }
    </React.Fragment>
  );
};

export default Reactive(PointComp);
