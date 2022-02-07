/* eslint-disable import/no-extraneous-dependencies */
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import './init';
import { MainScene } from './views/scene';
import { LeftPanel } from './views/leftPanel/index';
import 'antd/dist/antd.css';

ReactDOM.render(
  (
    <>
      <MainScene
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '75%',
        }}
      />
      <LeftPanel />
    </>
  ),
  document.getElementById('app')
);
