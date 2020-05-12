import { reactive } from '@turboo/turbox';
import React from 'react';
import { Point } from '../domain/point';

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
    </React.Fragment>
  );
};

export default reactive(PointComp);
