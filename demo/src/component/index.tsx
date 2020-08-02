import { config, init, Reactive, reactive, TimeTravel, computed, Action, mutation } from 'turbox';
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
import NormalPoint from './NormalPoint';

config({
  timeTravel: {
    isActive: true,
  },
  middleware: {
    logger: true,
    perf: true,
  }
});
export const cts = new Countertops({
  countertops: [new Countertop({
    lines: [],
    points: [],
    nickName: '',
  })],
});
const p = new Point({
  position: new Point2d(100, 100),
  type: EPointType.CIRCLE,
});

export const mainTimeTravel = TimeTravel.create();
TimeTravel.switch(mainTimeTravel);

init();

let count = 100;

const r = reactive(() => {
  console.log('&&&&&');
  // console.log(p.position);
  console.log(cts.countertops[0].points[0] && cts.countertops[0].points[0].position);
});

// const fullName = computed(cts.countertops[0].getFullName);
let action;

const DemoBox = Reactive(() => {
  const [flag, setFlag] = useState(true);
  const testAsync = async () => {
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
    const f = mutation('customName', async () => {
      await cts.countertops[0].addPoint(p);
    });
    await f();
    // await cts.countertops[0].testEffect(p, l);
    console.log('#####', 'done');
    // cts.countertops[0].testEffect(p, l);
    // cts.countertops[0].testTwoEffect(p, l);
  };
  const addPoint = () => {
    // TimeTravel.start('addPointAndLine', '添加点和线');
    const p = new Point({
      position: new Point2d(100, 100),
      type: EPointType.NONE,
    });
    const p2 = new Point({
      position: new Point2d(100, 100),
      type: EPointType.NONE,
    });
    cts.countertops[0].addPoint(p);
    cts.countertops[0].addPoint(p2);
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
  };

  const testMouseMove = () => {
    if (count === 100) {
      action = Action.create('testMouseMove', '测试鼠标移动');
    }
    if (count === 201) {
      return;
    }
    if (count === 200) {
      console.log(action);
      action.revert();
      const p = new Point({
        position: new Point2d(count, count),
        type: EPointType.NONE,
      });
      action.execute(() => {
        cts.countertops[0].addPoint(p);
      });
      action.complete();
      count++;
      return;
    }
    // takeLast takeLead
    // 完成：完成不仅会合并记录到撤销恢复栈，还会移出当前队列，还会 gc，防止内存泄漏
    // action.complete(); // 这么设计 API 是防止 action 为空，多写一个判断
    // const actions = Action.get('nameA', 'nameB'); 列出所有没完成的 action 队列 (action.name)
    // 清空：不仅要从队列里移除掉这个 action，最后 gc
    // action.abort(); 清空指定的 action
    // action.revert(); 回退掉未完成的已更改状态的部分
    // Action.abortAll(); 清空当前 action 队列

    count++;
    console.log('mouse move', count);
    const p = new Point({
      position: new Point2d(count, count),
      type: EPointType.NONE,
    });
    action.execute(() => {
      cts.countertops[0].addPoint(p);
    });
  };
  const testMutation = () => {
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
    cts.countertops[0].testTwoMutation(p, l);
  };
  const testComputed = () => {
    const ct1 = new Countertop({
      lines: [],
      points: [],
      nickName: 'ct1',
    });
    console.log(ct1.fullName);
    const ct2 = new Countertop({
      lines: [],
      points: [],
      nickName: 'ct2',
    });
    console.log(ct2.fullName);

    ct1.$update({
      firstName: 'AAA',
      // lastName,
    });
    console.log(ct1.fullName);
    console.log('imp', ct2.fullName);

    ct2.$update({
      firstName: 'FUCK',
      // lastName,
    });
    console.log(ct2.fullName);
    console.log('imp', ct1.fullName);
  };
  const testRender = () => {
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
    cts.countertops[0].ttt(p, l);
  };
  const testNickName = () => {
    cts.countertops[0].updateNickName('feifan');
  };
  console.log('***parent');

  React.useEffect(() => {
    console.log('parent didMount');
  }, []);

  return (
    <React.Fragment>
      {/* {cts.countertops.length && cts.countertops[0].points.length > 0 &&
        <div>position:
                    {cts.countertops[0].points[0] && cts.countertops[0].points[0].position.x},
                    {cts.countertops[0].points[0] && cts.countertops[0].points[0].position.y}
        </div>
      } */}
      <span>nickName: {cts.countertops[0].nickName}</span>
      {/* {cts.countertops.length && cts.countertops[0].info && cts.countertops[0].info.a &&
        <span>key：{cts.countertops[0].info.a}</span>
      } */}
      <br />
      {/* {cts.countertops.length && cts.countertops[0].normalPoints.map((np, index) => (
        <NormalPoint index={index} np={np} />
      ))} */}
      {/* <span>fullName：{fullName.get()}</span><br/> */}
      {/* <span>fullName2：{cts.countertops[0].fullName}</span><br /> */}
      {/* <span>firstName，lastName：{cts.countertops[0].firstName},{cts.countertops[0].lastName}</span> */}
      {cts.countertops.length && cts.countertops[0].lines.map(line => (
        <LineTpl data={line} />
      ))}
      {cts.countertops.length && cts.countertops[0].points.map((point, index) => (
        <PointTpl data={point} index={index} />
      ))}
      {/* {flag &&
        <DisposerTest />
      } */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '16px',
          transform: 'translateX(-50%)',
        }}
      >
        <button onClick={testNickName}>
          测试nickname
                </button>
        <button onClick={testRender}>
          测试重绘时机
                </button>
        <button onClick={testComputed}>
          测试 Computed
                </button>
        <button onMouseMove={testMouseMove}>
          测试MouseMove
                </button>
        <button onClick={testDisposer}>
          测试组件 Disposer
                </button>
        <button onClick={testAsync}>
          测试异步
                </button>
        <button onClick={testMutation}>
          测试多个Mutation
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
        <button onClick={() => r.dispose()}>
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
