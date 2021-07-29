import { config, init, reactive, createDomain, Reactive, TimeTravel, computed, Action, action as TurboxAction, mutation, use, reactor } from '@turbox3d/reactivity-react';
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
import Collection from './Collection';

config({
  timeTravel: {
    isActive: true,
  },
  middleware: {
    logger: true,
    perf: true,
  }
});
const middleware = ({ dispatch, getActionChain }) => (next) => (action) => {
  // balabala...
  const actionChain = getActionChain();
  console.log('actionChain', actionChain);
  const nextHandler = next(action); // 注意：返回值可能是个 promise
  // peipeipei...
  return nextHandler;
};
use(middleware);

export const cts = new Countertops({
  countertops: [new Countertop({
    lines: [],
    points: [],
    nickName: 'xxx',
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

// const r = reactive(() => {
//   console.log('reactive &&&&&');
//   // console.log(p.position);
//   console.log(cts.countertops[0].points[0] && cts.countertops[0].points[0].position);
// });

// const fullName = computed(cts.countertops[0].getFullName);
let action: Action;

interface IObj {
  test: string;
  xxx: string;
}

// const t = reactor<IObj>({
//   test: {
//     a: 111111,
//     b: 222222,
//   },
//   xxx: 'reactor xxx',
// });
// const t = reactor<Array<string>>(['111']);

// reactive(() => {
//   t.map(name => console.log(name));
// });

// const t = reactor<Map<string, string>>(new Map());

// reactive((nickName, a) => {
//   // console.log(t.get('222'));
//   console.log('$&$%^$^%%^$%^', nickName, a);
// }, {
//   // name: 'xxx',
//   deps: [
//     () => cts.countertops[0].nickName,
//     () => cts.countertops[0].info.a,
//   ],
// });

// const testReactorMutation = mutation('testReactor', () => {
//   t.set('111', '2222');
//   t.set('222', '2222A');
// });

// const domain = createDomain({
//   reactor: {
//     first: 'xxx',
//     last: 'vvv',
//   },
//   mutation: {
//     changeFirst() {
//       this.first = 'ddd';
//     }
//   },
//   computed: {
//     cp() {
//       return this.first + '***' + this.last;
//     }
//   },
//   action: {
//     ac() {
//       console.log('A*C');
//       this.changeFirst();
//     }
//   }
// });

// reactive(() => {
//   // console.log(domain.first, domain.last);
//   // console.log(domain.cp.get());
// });

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
  const updatePositionX = () => {
    p.updatePositionX();
  };
  const testDisposer = () => {
    setFlag(false);
  };

  const testMouseMove = async () => {
    if (count === 100) {
      action = Action.create('testMouseMove', '测试鼠标移动');
    }
    if (count === 201) {
      return;
    }
    if (count === 200) {
      console.log(action);
      action.undo(true);
      await cts.countertops[0].delay(2000);
      action.redo();
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
    // action.undo(); 回退掉未完成的已更改状态的部分
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
  const testMutation = async () => {
    const action = Action.create('testImmediately');
    await action.execute(async () => {
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
      await cts.countertops[0].testTwoMutation(p, l);
      console.log('________');
      await cts.countertops[0].testTwoMutation(p, l);
    });
    action.complete();
    // const p = new Point({
    //   position: new Point2d(100, 100),
    //   type: EPointType.NONE,
    // });
    // const l = new Line({
    //   start: new Point({
    //     position: new Point2d(200, 200),
    //     type: EPointType.NONE,
    //   }),
    //   end: new Point({
    //     position: new Point2d(200, 200),
    //     type: EPointType.NONE,
    //   }),
    // });
    // cts.countertops[0].testTwoMutation(p, l);
    // const p = new Point({
    //   position: new Point2d(100, 100),
    //   type: EPointType.NONE,
    // });
    // const l = new Line({
    //   start: new Point({
    //     position: new Point2d(200, 200),
    //     type: EPointType.NONE,
    //   }),
    //   end: new Point({
    //     position: new Point2d(200, 200),
    //     type: EPointType.NONE,
    //   }),
    // });
    // const action1 = TurboxAction('testImmediately', (a, b, c) => {
    //   console.log(a, b, c);
    //   cts.countertops[0].addPoint(p);
    // });
    // action1(1, 2, 3);
    // const action2 = TurboxAction('testImmediately2', () => {
    //   cts.countertops[0].addPoint(p);
    // });
    // action2();
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
    // nextTick(() => {
    //   console.log('%^%^%^%^%^');
    // });
  };
  const doThreeOp = () => {
    console.log(cts.countertops[0].threeVector);
    cts.countertops[0].doThreeOp();
  }
  const doMapOp = () => {
    cts.countertops[0].doMapOp();
  }
  const doSetOp = () => {
    cts.countertops[0].doSetOp();
  }
  const testReactor = () => {
    // testReactorMutation();
    // domain.ac();
    // domain.changeFirst();
  }
  const testActionDeco = () => {
    cts.countertops[0].testActionDeco(1, 2, 3);
  }
  console.log('***parent');

  React.useEffect(() => {
    console.log('parent didMount');
  }, []);
  console.log('nick name render');
  return (
    <React.Fragment>
      {/* {cts.countertops.length && cts.countertops[0].points.length > 0 &&
        <div>position:
                    {cts.countertops[0].points[0] && cts.countertops[0].points[0].position.x},
                    {cts.countertops[0].points[0] && cts.countertops[0].points[0].position.y}
        </div>
      } */}
      <span>nickName: {cts.countertops[0].nickName}</span>
      {cts.countertops.length && cts.countertops[0].info && cts.countertops[0].info.a &&
        <span>key：{cts.countertops[0].info.a}, key b：{cts.countertops[0].info.b}</span>
      }
      <br />
      {/* {cts.countertops.length && cts.countertops[0].normalPoints.map((np, index) => (
        <NormalPoint index={index} np={np} />
      ))} */}
      {/* <span>fullName：{fullName.get()}</span><br/> */}
      {/* <span>fullName2：{cts.countertops[0].fullName}</span><br /> */}
      <span>firstName，lastName：{cts.countertops[0].firstName},{cts.countertops[0].lastName}</span>
      {cts.countertops.length && cts.countertops[0].lines.map((line, index) => (
        <LineTpl key={index} data={line} />
      ))}
      {cts.countertops.length && cts.countertops[0].points.map((point, index) => <PointTpl key={index} data={point} index={index} />)}
      {/* {flag &&
        <DisposerTest />
      } */}
      <div>
        point p: {p.position.x},{p.position.y}
      </div>
      <div>
        three vector3: {cts.countertops[0].threeVector.x}
      </div>
      <Collection />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '16px',
          transform: 'translateX(-50%)',
        }}
      >
        <button onClick={testReactor}>
          测试函数式 reactor
                </button>
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
          测试异步Mutation
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
        {/* <button onClick={() => r.dispose()}>
          disposer
                </button> */}
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
        <button onClick={updatePositionX}>
          更改X位置
                </button>
        <button onClick={doThreeOp}>
          three setLength
                </button>
        <button onClick={doMapOp}>
          do Map op
                </button>
        <button onClick={doSetOp}>
          do Set op
                </button>
        <button onClick={testActionDeco}>
          测试 Action 装饰器
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

// reactive(() => {
//   console.log('reactive111 &&&&&');
//   // console.log(p.position);
//   console.log(cts.countertops[0].points[0] && cts.countertops[0].points[0].position);
// });

export default DemoBox;
