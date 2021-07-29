import { Reactive } from '@turbox3d/reactivity-react';
import React from 'react';
import { Line } from '../domain/line';

interface IProps {
  data: Line;
}

const LineComp: React.FC<IProps> = ({ data }) => {
  console.log('***childLine');
  React.useEffect(() => {
    console.log('line didMount');
  }, []);
  // React.useCallback(() => {

  // }, []);
  return (
    <React.Fragment>
      <span>line:
        <span>lineLength: {data.length}</span>
        <span>lineStart: ({data.start.position.x},{data.start.position.y})</span>
        <span>lineEnd: ({data.end.position.x},{data.end.position.y})</span>
        <button>line btn</button>
      </span>
    </React.Fragment>
  );
};

export default Reactive(LineComp);
