import { reactive } from '@turboo/turbox';
import React from 'react';
import { Line } from '../domain/line';

interface IProps {
  data: Line;
}

const LineComp: React.FC<IProps> = ({ data }) => {
  console.log('***childLine');
  return (
    <React.Fragment>
      <span>start: {JSON.stringify(data.start)}</span>
      <span>end: {JSON.stringify(data.end)}</span>
    </React.Fragment>
  );
};

export default reactive(LineComp);
