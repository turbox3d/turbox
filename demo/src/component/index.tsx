import { config, init, redo, reactive, undo } from '@turboo/turbox';
import React from 'react';
import { Countertop } from '../domain/countertop';
import { Countertops } from '../domain/countertops';
import { Line } from '../domain/line';
import { Point } from '../domain/point';
import LineTpl from './Line';
import PointTpl from './Point';
import Point2d from '../math/Point2d';
import { EPointType } from '../types/enum';

config({
  timeTravel: {
    isActive: true,
    maxStepNumber: 5,
  },
  middleware: {
    logger: true,
    effect: true,
  }
});
init();

const cts = new Countertops({
  countertops: [new Countertop({
    lines: [],
    points: [],
  })],
});

// reactive(() => {
//   const v = cts.countertops[0].points[0].position.x;
//   console.log(v);
// });

const DemoBox = reactive(() => {
  const testAsync = () => {
    const p = new Point({
      position: new Point2d(100, 100),
      type: EPointType.NONE,
    });
    const l = new Line({
      start: new Point({
        position: new Point2d(200, 200),
        type: EPointType.NONE,
      }),
      end: new Point({
        position: new Point2d(200, 200),
        type: EPointType.NONE,
      }),
    });
    cts.countertops[0].testEffect(p, l);
    cts.countertops[0].testEffect(p, l);
  };
  const addPoint = () => {
    const p = new Point({
      position: new Point2d(100, 100),
      type: EPointType.NONE,
    });
    cts.countertops[0].addPoint(p);
  };
  const addLine = () => {
    cts.countertops[0].addLine(new Line({
      start: new Point({
        position: new Point2d(200, 200),
        type: EPointType.NONE,
      }),
      end: new Point({
        position: new Point2d(200, 200),
        type: EPointType.NONE,
      }),
    }));
  };
  const updateFirstPointPosition = () => {
    cts.countertops[0].updateFirstPointPosition();
  };
  const undoHandler = () => {
    undo();
  };
  const redoHandler = () => {
    redo();
  };
  console.log('***parent');

  return (
    <React.Fragment>
      {cts.countertops[0].points.length > 0 &&
        <div>position:
                    {cts.countertops[0].points[0].position.x},
                    {cts.countertops[0].points[0].position.y}
        </div>
      }
      {cts.countertops[0].lines.map(line => (
        <LineTpl data={line} />
      ))}
      {cts.countertops[0].points.map((point, index) => (
        <PointTpl data={point} index={index} />
      ))}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '16px',
          transform: 'translateX(-50%)',
        }}
      >
        <button onClick={testAsync}>
          测试异步
                </button>
        <button onClick={addPoint}>
          添加一个点
                </button>
        <button onClick={addLine}>
          添加一根线
                </button>
        <button onClick={undoHandler}>
          撤销
                </button>
        <button onClick={redoHandler}>
          恢复
                </button>
        <button onClick={updateFirstPointPosition}>
          更改第一个点
                </button>
      </div>
    </React.Fragment>
  );
});

export default DemoBox;
