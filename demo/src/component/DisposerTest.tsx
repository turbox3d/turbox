import { Reactive } from 'turbox';
import React from 'react';
import { cts } from './index';

const Disposer: React.FC<{}> = () => {
  console.log('Disposer');
  // console.log(p.position);
  console.log(cts.countertops[0].points[0] && cts.countertops[0].points[0].position);
  return (
    <div>hello disposer</div>
  )
};

export default Reactive(Disposer);
