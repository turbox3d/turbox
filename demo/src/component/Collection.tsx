import { Reactive } from '@turbox3d/reactivity';
import React from 'react';
import { cts } from './index';

const Collection: React.FC<{}> = () => {
  console.log('Collection');
  return (
    <div>
      <div>
        test Map:
        {/* {cts.countertops[0].myMap.size}<br /> */}
        {/* {cts.countertops[0].myMap.get(0)}<br /> */}
        {/* {cts.countertops[0].myMap.has(0) ? 'true' : 'false'}<br /> */}
        {/* {cts.countertops[0].myMap.get(1)}<br /> */}
        {/* {cts.countertops[0].myMap.has(1) ? 'true' : 'false'}<br /> */}
        {/* {cts.countertops[0].myMap.forEach((value, key) => {
          console.log(value, '...', key);
        })}<br /> */}
        {/* {cts.countertops[0].myMap.entries()}<br /> */}
        {/* {cts.countertops[0].myMap.keys()}<br /> */}
        {/* {cts.countertops[0].myMap.values()}<br /> */}
      </div>
      <div>
        test Set:
        {/* {cts.countertops[0].mySet.size}<br /> */}
        {/* {cts.countertops[0].mySet.has(0) ? 'true' : 'false'}<br /> */}
        {/* {cts.countertops[0].mySet.has(1) ? 'true' : 'false'}<br /> */}
        {/* {cts.countertops[0].mySet.has(1000) ? 'true' : 'false'}<br /> */}
        {/* {cts.countertops[0].mySet.forEach((value) => {
          console.log(value, '@@@');
        })}<br /> */}
        {/* {cts.countertops[0].mySet.entries()}<br /> */}
        {/* {cts.countertops[0].mySet.keys()}<br /> */}
        {/* {cts.countertops[0].mySet.values()}<br /> */}
      </div>
    </div>
  );
};

export default Reactive(Collection);
