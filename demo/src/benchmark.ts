import { reactor, mutation, Domain, reactive, init, config } from '@turbox3d/reactivity-react';
// import { observable, action, autorun } from 'mobx';

class TestTurbox extends Domain {
  @reactor() a = {
    a: {
      a: {
        a: {
          a: {
            a: {
              a: 0,
            },
          },
        },
      },
    },
  };

  @mutation do() {
    this.a.a.a.a.a.a.a += 1;
  }

  @mutation
  async innerDo() {
    for (let index = 0; index < 1000; index++) {
      this.a.a.a.a.a.a.a += 1;
    }
  }
}

const td = new TestTurbox();

(() => {
  /** 关闭时间旅行和 logger，因为 mobx 没有，但是理论上仍然做不到完全公平，这部分是有开销的 */
  config({
    timeTravel: {
      isActive: false,
    },
    middleware: {
      logger: false,
    }
  });
  init();
  let start, end;
  reactive(() => {
    end = performance.now();
    console.log('turbox:', end - start);
    console.log('turbox:', td.a.a.a.a.a.a.a);
  });
  start = performance.now();
  /** 1. 多次调用可复用的 mutation */
  // for (let index = 0; index < 1000; index++) {
  //   td.do();
  // }
  /** 2. 循环放在函数里面 */
  td.innerDo();
  // console.dir(performance.memory);
})();

// class TestMobx {
//   @observable a = {
//     a: {
//       a: {
//         a: {
//           a: {
//             a: {
//               a: 0,
//             },
//           },
//         },
//       },
//     },
//   };

//   @action do() {
//     this.a.a.a.a.a.a.a += 1;
//   }

//   @action innerDo() {
//     for (let index = 0; index < 1000; index++) {
//       this.a.a.a.a.a.a.a += 1;
//     }
//   }
// }

// const tm = new TestMobx();

// (() => {
//   let start, end;
//   autorun(() => {
//     end = performance.now();
//     console.log('mobx:', end - start);
//     console.log('mobx:', tm.a.a.a.a.a.a.a);
//   });
//   start = performance.now();
//   /** 1. 多次调用可复用的 action */
//   for (let index = 0; index < 1000; index++) {
//     tm.do();
//   }
//   /** 2. 循环放在函数里面 */
//   // tm.innerDo();
//   console.dir(performance.memory);
// })();
