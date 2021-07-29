
import React from 'react';
import { Reactive } from '@turbox3d/reactivity-react';
import { cts } from './index';

interface IProps {
  index: number;
  np: object;
}

const NormalPoint: React.FC<IProps> = Reactive(({ index, np }) => {
  console.log(index, np, '&(*(&(*&(&');
  const updateFirstPointPosition = (index) => () => {
    cts.countertops[0].updatePointByIndex(index, false);
  }

  return (
    <div>
      np position: { (np as any).position.isActive ? 'true' : 'false' }
      <button onClick={updateFirstPointPosition(index)}>point btn</button>
    </div>
  );
});

export default NormalPoint;
