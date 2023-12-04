import * as ReactDOM from 'react-dom';
import * as React from 'react';
import DemoBox from './component/index';
// import { Scene2DFront } from './2d';
// import { Scene3DFront } from './3d';

ReactDOM.render(
  (
    <React.Fragment>
      <DemoBox />
      {/* <Scene2DFront /> */}
      {/* <Scene3DFront /> */}
    </React.Fragment>
  ),
  document.getElementById('app')
);
// import './benchmark';
