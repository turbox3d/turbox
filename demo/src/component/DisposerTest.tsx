import { Reactive, reactive } from '@turbox3d/reactivity-react';
import React from 'react';
import { cts } from './index';

const r = reactive(() => {
  console.log('^^^^^');
});

const Disposer: React.FC<{}> = () => {
  console.log('Disposer');
  // console.log(p.position);
  console.log(cts.countertops[0].points[0] && cts.countertops[0].points[0].position);
  return (
    <div>hello disposer</div>
  )
};

export default Reactive(Disposer);
