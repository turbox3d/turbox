import { config, init, Reactive, reactive, TimeTravel } from 'turbox';
import React, { useState } from 'react';
import { Countertop } from '../domain/countertop';
import { Countertops } from '../domain/countertops';
import { Line } from '../domain/line';
import { Point } from '../domain/point';
import LineTpl from './Line';
import PointTpl from './Point';
import Point2d from '../math/Point2d';
import { EPointType } from '../types/enum';
import DisposerTest from './DisposerTest';

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

export const mainTimeTravel = TimeTravel.create();
TimeTravel.switch(mainTimeTravel);

export const cts = new Countertops({
  countertops: [new Countertop({
    lines: [],
    points: [],
  })],
});

const p = new Point({
  position: new Point2d(100, 100),
  type: EPointType.CIRCLE,
});

const disposer = reactive(() => {
  console.log('&&&&&');
  // console.log(p.position);
  console.log(cts.countertops[0].points[0] && cts.countertops[0].points[0].position);
});

const DemoBox = Reactive(() => {
  const [flag, setFlag] = useState(true);
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
    // cts.countertops[0].testEffect(p, l);
    // cts.countertops[0].testEffect(p, l);
    cts.countertops[0].testTwoEffect(p, l);
  };
  const addPoint = () => {
    // TimeTravel.start('添加点和线');
    const p = new Point({
      position: new Point2d(100, 100),
      type: EPointType.NONE,
    });
    cts.countertops[0].addPoint(p);
  };
  const removePoint = () => {
    cts.countertops[0].removePoint(1);
  }
  const addKey = () => {
    cts.countertops[0].addKey();
  }
  const removeKey = () => {
    cts.countertops[0].removeKey();
  }
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
    // TimeTravel.complete();
  };
  const updateFirstPointPosition = () => {
    cts.countertops[0].updateFirstPointPosition();
  };
  const undoHandler = () => {
    console.log('undoable', TimeTravel.undoable);
    if (TimeTravel.undoable) {
      TimeTravel.undo();
    }
  };
  const redoHandler = () => {
    console.log('redoable', TimeTravel.redoable);
    if (TimeTravel.redoable) {
      TimeTravel.redo();
    }
  };
  const updatePosition = () => {
    p.updatePosition(new Point2d(200, 200));
  };
  const testDisposer = () => {
    setFlag(false);
  }
  console.log('***parent');

  return (
    <React.Fragment>
      {/* {cts.countertops.length && cts.countertops[0].points.length > 0 &&
        <div>position:
                    {cts.countertops[0].points[0] && cts.countertops[0].points[0].position.x},
                    {cts.countertops[0].points[0] && cts.countertops[0].points[0].position.y}
        </div>
      } */}
      {/* {cts.countertops.length && cts.countertops[0].info && cts.countertops[0].info.a &&
        <span>{cts.countertops[0].info.a}</span>
      } */}
      {/* {cts.countertops.length && cts.countertops[0].lines.map(line => (
        <LineTpl data={line} />
      ))} */}
      {cts.countertops.length && cts.countertops[0].points.map((point, index) => (
        <PointTpl data={point} index={index} />
      ))}
      {flag &&
        <DisposerTest />
      }
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '16px',
          transform: 'translateX(-50%)',
        }}
      >
        <button onClick={testDisposer}>
          测试组件 Disposer
                </button>
        <button onClick={testAsync}>
          测试异步
                </button>
        <button onClick={addPoint}>
          添加一个点
                </button>
        <button onClick={removePoint}>
          删除一个点
                </button>
        <button onClick={addKey}>
          加key
                </button>
        <button onClick={removeKey}>
          删key
                </button>
        <button onClick={() => disposer()}>
          disposer
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
        <button onClick={updatePosition}>
          更改位置
                </button>
        <button onClick={() => TimeTravel.pause()}>
          暂停
                </button>
        <button onClick={() => TimeTravel.resume()}>
          继续
                </button>
        <button onClick={() => TimeTravel.clear()}>
          清空
                </button>
        <button onClick={() => {
          const a = TimeTravel.create();
          TimeTravel.switch(a);
        }}>
          切换撤销恢复空间
                </button>
        <button onClick={() => console.log(TimeTravel.currentTimeTravel!.transactionHistories)}>
          打印历史记录
                </button>
      </div>
    </React.Fragment>
  );
});

export default DemoBox;
