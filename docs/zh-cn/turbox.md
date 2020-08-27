# Turbox

[![build status](https://img.shields.io/travis/com/turbox3d/turbox/master.svg?style=flat-square)](https://travis-ci.com/github/turbox3d/turbox)
[![license](https://img.shields.io/github/license/turbox3d/turbox?style=flat-square)](https://travis-ci.com/github/turbox3d/turbox)
[![npm version](https://img.shields.io/npm/v/turbox.svg?style=flat-square)](https://www.npmjs.com/package/turbox)
[![npm downloads](https://img.shields.io/npm/dm/turbox.svg?style=flat-square)](https://www.npmjs.com/package/turbox)
[![install size](https://img.shields.io/bundlephobia/minzip/turbox?style=flat-square)](https://www.npmjs.com/package/turbox)

## 介绍
**turbox**（涡轮）是一个适合大型生产力单页软件应用的前端框架，场景来源于复杂大型 3D 业务。

turbox 框架的定位是大型生产力应用的前端框架，但目前暂时还是以状态管理为主，turbox 是响应式流派的状态管理，但会更针对特定场景设计，而目前市面上的流行框架大多针对 web 应用，而且发展方向是足够通用，对我们之前的业务来说无疑是走歪了。为了通用这就不免会在比如性能、体积、不同风格 api、功能性、易用性上面做一些权衡，但不管是 mobx 还是 redux，在以前的业务场景中都无法较好满足，而且 mobx 的扩展性不如 redux，几乎无法在它上面做二次开发，所以诞生了 turbox。

### turbox 框架架构图
![framework](https://img.alicdn.com/tfs/TB1fRl5g79l0K4jSZFKXXXFjpXa-2231-1777.png)

### 快速上手
一个最简单的例子：
```js
// line.js
import { Domain, reactor, mutation } from 'turbox';

class Line extends Domain {
  @reactor start?: Point;
  @reactor end?: Point;

  @mutation
  updateLine(start: Point, end?: Point) {
    this.start = start;
    this.end = end;
  }

  constructor(start: Point, end: Point) {
    this.start = start;
    this.end = end;
  }
}

export default Line;
// point.js
import { Domain, reactor, mutation } from 'turbox';

class Point extends Domain {
  @reactor prevLine?: Line;
  @reactor nextLine?: Line;
  @reactor position: Point2d;
  @reactor type: EPointType;

  @mutation
  buildLink(prevLine: Line, nextLine?: Line) {
    this.prevLine = prevLine;
    this.nextLine = nextLine;
  }

  constructor(position: Point2d) {
    this.position = position;
  }
}

export default Point;

// component.jsx
import { Component } from 'react';
import { Reactive } from 'turbox';
import Point from './point';
import Line from './line';

const p1 = new Point(new Point2d(1, 1));
const p2 = new Point(new Point2d(2, 2));
const $line = new Line(p1, p2);

@Reactive()
export default class extends Component {
  render() {
    return (
      <div>
        <span>{$line.start.position.x}{$line.start.position.y}</span>
        <button onClick={() => $line.updateLine(new Point(new Point2d(3, 3)))}>add</button>
      </div>
    );
  }
}

// function-component.jsx
import * as React from 'react';
import { Reactive, reactive } from 'turbox';
import Point from './point';
import Line from './line';

const p1 = new Point(new Point2d(1, 1));
const p2 = new Point(new Point2d(2, 2));
const $line = new Line(p1, p2);

const Layout = Reactive(() => {
  const test = () => {
    $line.updateLine(new Point(new Point2d(4, 4)));
  };

  React.useEffect(() => {
    $line.updateLine(new Point(new Point2d(3, 3)));
  }, []);

  return (
    <div>
      <span>{$line.start.position.x}{$line.start.position.y}</span>
      <button onClick={test}>add</button>
    </div>
  );
});

export default Layout;

// normal function
reactive(() => {
  /* render mesh */
});

// entry.js
import React from 'react';
import Turbox from 'turbox';
import Layout from './component';
// import Layout from './function-component'; // use function component

Turbox.render(<Layout />, '#app');
```

## 使用说明

### 安装
```
$ npm install --save turbox

$ yarn add turbox
```

> 本框架有依赖 decorator，你需要安装 transform-decorators-legacy, transform-class-properties, babel7 的话用 @babel/plugin-proposal-decorators

### 兼容性
**turbox** 支持大部分现代浏览器，由于使用了 Proxy API，在 IE 和一些低版本浏览器下不支持，还使用了 Reflect、Symbol、Promise、Map、Set API，如需兼容需要自行引入 polyfill

## API & 概念
### reactor
在 **mobx** 中，会用 @observable 的装饰器来表示这是一个响应式状态属性，而在 **turbox** 中，通过 @reactor 的装饰器来声明，这样框架就能代理掉属性的 getter、setter 等操作，如下代码所示：
```js
export class MyDomain extends Domain {
  @reactor isLoading = false;
  @reactor() list = [];
  @reactor(true, true, function(target, property) {}) prop = 'prop';
}
```

> reactor 装饰器可以加括号传参，也可以不加括号不传参，框架都支持，其他装饰器比如 mutation、effect、Reactive 同理

> reactor 装饰器有三个参数，第一个参数是 deepProxy，用来表示是否需要深度代理，默认开启，这样可以支持深层 mutable 的写法，默认也会对数据结构做性能优化，如果关闭，则需要通过拷贝赋值的方式来触发更新，或者其他 immutable 的方式，否则不会触发更新。

> 第二个参数是 isNeedRecord，表示该属性是否需要被记录到时间旅行器中，该属性可以覆盖掉 domain context 里的配置。

> 第三个参数是个 callback 回调，当该属性被使用（get）时，该函数会被触发，该回调有两个参数，第一个参数是 target 对象，第二个参数是被使用时的属性 key，如果访问的是深层次节点则 target 指代的是当前深层次的访问对象，property 则为深层次使用时的属性 key，应该尽量避免使用该回调，可能会造成死循环，只在一些极特殊场景使用。

> 支持基本数据类型、数组、对象、自定义 class 的实例、domain 的实例、Map、Set、WeakMap、WeakSet

### mutation
在 **redux** 中，我们写的最多的就是 reducer，它是用来处理数据更新操作，传统意义来说，reducer 是一个具有输入输出的纯函数，它更像是一个物料，或是一个早就定制好的流水线，任何相同的输入，一定会得到相同的输出，它的执行不会改变它所在的环境，外部环境也不应该影响它，这种特性似乎非常适合 **react** 数据状态机的思想，每一个 snapshot 都对应着一份数据，数据变了，就产生了新的 snapshot。

在 **mobx** 中，没有 reducer，它从另一个思想，响应式编程的角度来试图解决状态的传递，本质上对原始引用做了一份代理，任何一次更新都会直接反馈到原始引用，并广播到所有依赖过的地方并触发它们，类似 **vuex** 中的 mutation 的概念，它是一种突变，不是一个纯函数。

从关注点精度来说，**mobx** 是属性级别的，而 **redux** 是某个容器的全局状态机，**redux** 虽然可以通过 combine 来降低关注点，但使用上配合 **immutable** 还是比 **mobx** 要麻烦一些，易用性上这一点 **mobx** 更好，只需要关注对应的属性。但精度过细也有缺点，比如我需要做一组操作的状态回退，或是自描述一套流程，就比较难直接快速的看出来，不过 **mobx** 后来也有了 action 的概念，不过必须启用 enforce actions 严格模式才有意义。

**turbox** 中提供了 mutation 装饰器专门做数据处理和更新，一些业务流程和外部数据的获取，则可以被隔离开，这有助于更好的描述业务流程、复用复杂一些的更新计算逻辑等，使用形式如下：
```js
// turbox
class MyDomain extends Domain {
  @reactor() currentIdx = 0;
  @reactor() array = [];

  @mutation('xxx', true)
  changeIdx1(idx) {
    this.currentIdx = idx;
    this.array.push('aaa');
  }

  @mutation()
  changeIdx2(idx) {
    this.currentIdx = idx;
  }

  async handleProcess() {
    this.changeIdx2(1);
    this.changeIdx2(2);
    const { result } = await $API.get('/api/balabala');
    this.changeIdx1(result);
    this.changeIdx1(result + 1);
  }
}
```

正常情况我们都会使用同步的 mutation，这也符合业界状态机的思想，有副作用就可以使用普通的 async 函数来做到，但有些场景，我们希望忽略掉副作用，但它的计算过程是异步的，这时候我们可以使用异步的 mutation 来做到这件事，也就是说即使执行到 mutation 里面的 await，也不会立即把计算结果响应到 reactive 层，这时候忽略副作用，认为这个中间计算结果不应该被响应，必须等到该 mutation 完成才响应：

```js
class MyDomain extends Domain {
  @reactor() currentIdx = 0;
  @reactor() array = [];

  @mutation('xxx', true)
  changeIdx1(idx) {
    this.currentIdx = idx;
    this.array.push('aaa');
  }

  @mutation()
  changeIdx2(idx) {
    this.currentIdx = idx;
  }

  @mutation()
  async changeIdx3(idx) {
    this.currentIdx = idx;
    const res = await fetch();
    this.currentIdx = res;
  }

  async handleProcess() {
    this.changeIdx2(1);
    await this.changeIdx3(3);
    const { result } = await $API.get('/api/balabala');
    this.changeIdx1(result);
    this.changeIdx1(result + 1);
  }
}
```

如果有多个异步的 mutation 需要计算，并且中间结果不想被立即响应，可以在外层包裹一个 mutation 函数，不然的话，出了异步 mutation 作用域以后就会立即响应一次：

```js
class MyDomain extends Domain {
  @reactor() currentIdx = 0;
  @reactor() array = [];

  @mutation('xxx', true)
  async changeIdx1(idx) {
    this.currentIdx = idx;
    const res = await fetch();
    this.array.push('aaa');
  }

  @mutation()
  async changeIdx2(idx) {
    this.currentIdx = idx;
    const res = await fetch();
  }

  @mutation()
  async changeIdx3(idx) {
    this.currentIdx = idx;
    const res = await fetch();
    this.currentIdx = res;
  }

  @mutation()
  async wrap() {
    await this.changeIdx1(2);
    await this.changeIdx2(2);
    await this.changeIdx3(3);
  }

  async handleProcess() {
    await this.wrap();
    const { result } = await $API.get('/api/balabala');
  }
}
```

有些时候我们不想用装饰器，也不想自己去建个 domain 类，还想取个运行时才确定的 mutation 名称，就可以用下面这种函数式的 mutation 写法：
```js
const f = mutation('customName', async () => {
  await cts.countertops[0].addPoint(p);
}, {
  immediately: true,
  name: '自定义名称',
});
await f();
```

> 注意下 mutation 装饰器的参数，第一个参数可以自定义 mutation 的名称，如未指定则默认使用函数名，第二个参数代表这个 mutation 是否需要被当做一次独立的事务，默认是 false，所有的同步 mutation 会被合并成一个 history record 后再触发重新渲染，否则，每一次 mutation 执行完都会立刻触发一次重新渲染，并会被作为一次独立的操作记录到时间旅行器中

> mutation 里面可以嵌套 mutation，但不可以嵌套 effect，看到下面 effect 那一小节你就会知道为什么

> mutation 是用来做变更的，符合规范的情况是它不应该有返回值，也没有必要有返回值，但如果有场景一定要返回值，也是可以接收到的

#### $update
上面例子的更新计算逻辑比较简单，单独抽一个 mutation 只是为了写几行简单赋值语句有点麻烦，并且没有复用性（实际上大部分数据模型不复杂的 web 前端应用基本都是简单赋值），而直接对属性赋值又回到了非严格模式的 **mobx** 的问题，声明能力差，无法自定义状态回退的事务粒度，也可能会和非 observable 的成员属性混在一起难以区分，所以对于复杂一些的逻辑依然是抽成一个 mutation 来写，隐藏复杂实现，内聚并复用，但简单的赋值更新 **turbox** 专门提供了内置的操作符（语法糖）来解决这个问题，并且该操作也可作为一个 record 来回退，使用如下：
```js
class MyDomain extends Domain {
  @reactor() currentIdx = 0;
  @reactor() array = [];

  changeState(idx) {
    this.$update({
      currentIdx: idx,
      array: ['aaa'],
    }, 'doSomething', '做些事');
  }
}
```
> 和 redux 一样，更新 domain 中的 reactor state 是一个同步的过程，触发 mutation 操作（默认多次会被合并），如果状态改变了，都会触发一次依赖到此操作状态的组件的 forceUpdate() 方法来执行 reRender

> 要在 mutation 中更新数组状态，可以直接使用数组原生 API，也可以直接操作数组下标或直接赋值，都能触发重新渲染，这是因为 turbox 使用了 Proxy 的能力

> 可以使用构造函数对 reactor 修饰的属性赋值，这是因为在构造时，属性一定还没有被视图层观察，在这之前，你可以对这个实例的属性做任何修改，但一旦渲染完毕后，就只能通过 mutation 或 $update 来做修改

> 在属性已经被视图层观察（使用）后，你只能在 mutation 调用范围内对该属性赋值或使用 $update 来更新数据，在其他普通函数中直接对 reactor 修饰过的属性赋值会得到一个错误，You cannot update value to observed \'@reactor property\' directly. Please use mutation or $update({})，这是为了防止非法操作导致状态和视图不同步的情况出现

> 在传统 web 应用中，状态通常是设计成一棵较为扁平化的树，每个 domain 的 mutation 只关心当前 domain 的 reactor state，不关心其他 domain 的 reactor state，如果有关联多使用组合而非继承或图状关系，但数据模型稍微复杂一些的业务，仅仅使用组合难以满足需求，现实情况可能就是存在父子或兄弟关系，也必然伴随着一个 mutation 会同时操作当前 domain 和其他关联 domain 的情况，这种情况只要保证在 mutation 调用范围内，即便对其他 domain 的 reactor state 直接赋值也不会抛错

### action
`action` 通常是用来灵活控制操作行为的 api，可以简单的理解为一种主动事务的机制，会影响撤销恢复的粒度。比如我们可以定义如下的一个 action：
```js
class MyDomain extends Domain {
  @reactor isLoading = false;
  @reactor readList = [];

  @mutation
  isLoaded({ readList }) {
    if (readList) {
      this.readList = readList;
    }
    this.isLoading = false;
  }

  async fetchReadList() {
    const action = Action.create('fetchReadList', '拉取阅读列表');
    action.execute(() => {
      // mutation 更新操作放在这
      this.isLoading();
    });
    const { readList } = await API.get('/api/balabala');
    action.execute(() => {
      // mutation 更新操作放在这
      this.isLoaded({ readList });
    });
    action.complete();
  }
}
```
在合适的时机创建一个 action 实例，需要绑定到该 action 的更新操作需要放到 execute 函数中执行，这样即使不在当前执行栈中，或是一些并发异步的场景，或是没有在该 action execute 范围中执行的更新，均不会影响到该 action 作为一个独立的事务加入到撤销恢复栈中，在 complete 完成之前，所做的所有更新都会被合并到一次行为，在调用 complete 后，保存到撤销恢复栈中。上面的例子是写在一个函数中的，有时候我们是通过组合事件动作来完成一个事务，举个例子：
```js
class MyDomain extends Domain {
  @mutation
  drawPoint() {
  }

  @mutation
  drawLine() {
  }
}

const drawDomain = new MyDomain();

const action = Action.create('drawLine', '画一根线');
const drawLine = () => {
  action.execute(() => {
    drawDomain.drawLine();
  });
  if (balabala) {
    action.complete();
  }
};
const drawPoint = () => {
  action.execute(() => {
    drawDomain.drawPoint();
  });
};

/* 先画一个点，再画一根线，再画一个点，完成组合操作，假设不在一个执行栈中完成 */
drawPoint();
drawLine();
drawPoint();
```
有些时候，我们需要更灵活的控制，可以直接获取行为池中的实例来进行控制，不传参数则获取所有，也可以根据 key 来筛选，如下所示：
```js
const actions = Action.get('actionKeyA', 'actionKeyB'); // 列出所有没完成的 action

/* 下面是 action 的接口 */
enum ActionStatus {
  WORKING = 'working',
  COMPLETED = 'completed',
  ABORT = 'abort',
}

interface Action {
  name: string;
  displayName: string;
  status: ActionStatus;
  historyNode: HistoryNode;
}
```
有些时候我们需要做类似 takeLead、takeLast 的操作，丢弃掉前面几次未完成的事务或后面几次的，可以使用 abort：
```js
action.abort(revert = true);
// 丢弃当前未完成池中的所有事务
Action.abortAll();
```
abort 会把事务池中的当前事务移除，并且阻止未完成的事务继续执行 execute 和 complete，还会根据 revert 参数来决定是否需要回退掉已经发生更改的状态，并丢弃掉 diff 记录，不进撤销恢复栈。

也可以单独调用 revert api 来回滚状态：
```js
action.revert();
```

### effect（即将重做）
单向数据流中一个操作就会产生一次数据映射，但在一些有复杂异步流的场景，一个行为会同时触发多次数据更新操作并且需要更新多次 UI，这个就是我们所说的数据流“副作用”，通常这种行为会发生在一些异步接口调用和一些分发更新操作的流程中，在 **redux** 中，会使用一些中间件来解决此类问题，比如 **redux-thunk**、**redux-saga**、**redux-observable** 等，在 **mobx** 中，side effect 统一可以交给 @action 装饰器修饰的函数处理，虽然功能没有那么强大。**turbox** 默认提供内置的 effect 中间件，这样就可以处理副作用了，使用方法如下：
```js
import { throttle, bind } from 'lodash-decorators';

class MyDomain extends Domain {
  @reactor isLoading = false;
  @reactor readList = [];

  @mutation
  isLoaded({ readList }) {
    if (readList) {
      this.readList = readList;
    }
    this.isLoading = false;
  }

  @throttle(300) // 可以用一些装饰器来控制函数执行
  @bind()
  @effect('获取阅读列表')
  async fetchReadList(action) {
    action.execute(() => {
      this.isLoading();
    });
    const { readList } = await API.get('/api/balabala');
    action.execute(() => {
      this.isLoaded({ readList });
    });
  }

  async fetchReadList2() {
    this.isLoading();
    const { readList } = await API.get('/api/balabala');
    this.isLoaded({ readList });
  }
}
```
我们看到上面代码提供了两种方式来处理副作用，看起来似乎普通的 async 函数也可以做到同样的事情，并且写法更简洁，那么 effect 装饰器修饰的函数与普通函数相比有什么区别呢？区别就在于 effect 函数本身会被作为一个独立的包含副作用的操作经过中间件处理，同时会帮助你自动创建 action 实例，并回传 action 参数给用户来进行调用，在 effect 执行完成后会帮助你自动 complete 该次 action，记录到撤销恢复栈中，简单可以理解为 effect 是 action 的一个经过中间件的增强语法糖。

> 在 effect 函数中不能直接通过 this 去修改状态，只能读取，修改必须要通过 mutation，或者使用 $update 语法糖。这么设计是为了遵守更新过程与业务流程逻辑的分离，做到单一职责，如果不强制可能会导致过程式的代码很多，写出完全不考虑复用性、可读性、可维护性的代码，此举确实会导致写起来稍微麻烦一点点，但看起来对于更新流程的描述更清晰了

> effect 修饰的函数大部分情况下都是异步的，但也不排除分发了多个同步的 mutation 操作，多个同步代码顺序是可以信赖的，后面的代码可以拿到更新后的状态，异步的操作不可以，必须用 await 等待完成后才能拿到最新的状态

> effect 可以嵌套 effect，记录操作行为的粒度始终以 effect 回传的 action 参数来控制

> effect 装饰器的参数可以自定义名称，如果未指定，默认使用函数名

后续 **turbox** 会把一些特殊的操作符挂载到 effect 修饰过的函数里，专门处理异步流程，如果所有操作都是同步的，那就没有 operator（操作符）什么事情了，但现实情况是某些场景异步任务非常多，虽然说大多数场景 async 函数和默认的基础中间件就已经足够了，但在一些异步任务竞争的场景还是不够用的，比如在异步任务还没完成的时候，下几次触发又开始了，并且这几个异步任务之间还有关联逻辑，如何控制调度这些异步任务，就需要通过各种 operator 来处理了。

### computed
2d、3d 业务的计算通常比较复杂，需要根据某几个原始 reactor state 的值自动触发算法或公式，计算出视图真正需要的状态，计算功能的意义在于可以收敛计算代码并且缓存计算结果以提高性能。

在视图中放入太多的逻辑会让组件过重且难以维护，并且无法复用计算逻辑。如果原始 reactor state 没有发生变化，就不应该重复执行耗时的计算，因为两次计算的结果一定是一样的，直接返回上一次计算过的结果性能更佳。使用方式如下代码所示：

```js
class TestDomain extends Domain {
  @reactor() firstName = 'Jack';
  @reactor() lastName = 'Ma';

  @computed({ lazy: true })
  get fullName() {
    return this.firstName + ' ' + this.lastName;
  }

  /** 这种写法虽然看起来优雅但不推荐，一个是因为只在 ts 下支持，另一个是因为做了 hack，会导致语法高亮识别为函数而不是属性，并且无法写原生 set */
  @computed()
  fullName = () => {
    return this.firstName + ' ' + this.lastName;
  }
}
```

有时候我们不想使用装饰器，可以直接用 computed 函数：

```js
const fullName = computed(() => {
  // 注意一下作用域，默认不会帮你绑定作用域
  return this.firstName + ' ' + this.lastName;
}, {
  lazy: true,
});

// 使用属性的时候得调用 get 方法，因为没法对原始数据类型做代理，并且需要惰性求值能力
fullName.get();
```

> 计算属性只会在用到该属性的时候才会发生计算，确保性能最佳

> 计算属性有一个 lazy 的配置参数，该参数决定计算值是否需要实时计算，默认开启惰性计算，意味着只会在重新渲染或执行之前才会做一次 dirty 检察，在这之前计算值一直是旧的。如果关闭，那么在每次原子操作 (mutation、$update) 之后都会检察计算值是否 dirty，这样会多消耗一些性能，但是可以保证每次更新完得到的计算结果都是最新的，两种方式都有使用场景

<!-- ### watch（暂未实现，敬请期待）
某些情况需要根据数据的变化引发其他外部操作或数据的更新，这时候可以利用 watch，大部分情况并不推荐使用这种做法，因为这可能会导致程序难以测试并且不可预测，还有可能造成死循环，魔法过多对维护也会造成很大的代价。只在某些特别必要的场景，比如某些数据就是有极强的关联性，会导致外部操作或外部数据的更新，部分情况很难在所有应该触发更新的地方去手动调用触发更新，为了减少心智负担才用。 -->

### Domain
在上面的例子中，我们会发现有个 Domain 的基类，在 **turbox** 中，Domain 只是类似 React.Component 这样的基类，声明这是一个领域模型，提供了一些通用方法和控制子类的能力，该类的装饰器实际也会依赖基类上的一些私有方法，所以需要配套使用，如下代码所示：
```js
import { Domain, reactor, reducer, mutation } from 'turbox';

export class MyDomain extends Domain {
  @reactor result = 0;

  @mutation
  isLoaded(result) {
    if (result) {
      this.result = result;
    }
  }

  fetchData = async () => {
    const { result } = await $API.get('/api/balabala');
    this.isLoaded(result);
  }

  initDomainContext() {
    return {
      isNeedRecord: false,
    };
  }

  constructor() {
    super();
  }
}
```

使用的时候就跟普通的 class 一样，如下所示：
```js
import { Domain, reactor, reducer, mutation } from 'turbox';

class MyDomain extends Domain {
  @reactor() isLoading = false;

  @mutation
  updateLoading() {
    this.isLoading = true;
  }
}

const $ins1 = new MyDomain();
$ins1.updateLoading();
$ins1.isLoading; // true
const $ins2 = new MyDomain();
$ins2.isLoading; // still be false
```

以上完全是面向对象的风格，实际上在大部分复杂应用中，我们都会使用面向对象来组织我们的应用，比较简单直接，描述模型，实例隔离，收敛内聚，更符合人类的思维方式

> Domain 的子类可以实现一个 initDomainContext 方法，该方法用来声明 Domain 的 context，目前只有 isNeedRecord 属性，用来标记这个类所有响应式属性是否需要记录到撤销恢复栈中

> Domain 上还提供了 $update 方法，它是更新数据的语法糖，类似 react 的 setState，上面有一小节已经提过

当然除了面向对象，函数式风格也是一种不错的组织方式，这里不讨论他们的优劣，只不过确实都存在不同的适用场景，这种情况，Domain 的概念就被弱化了，更多的是一种松散组合的方式，这也是函数式编程推崇的，如下代码所示：
```js
const objectValue = reactor({});
const arrayValue = reactor([]);
const m = mutation('customNameMutation', () => {});
m();
const e = effect('customNameEffect', async () => {});
e();
const computedValue = computed(() => objectValue.xxx + arrayValue[0]);
```

> reactor、effect 的函数式 API 待实现

### Reactive
**turbox** 中的 @Reactive 装饰器，有点类似于 **mobx** 的 @observer，它的作用就是标记这个 react 组件需要自动同步状态的变更。它实际上是包裹了原始组件，返回了一个新的组件，将大部分同步状态的链接细节给隐藏起来。要使用 domain 中的状态和函数，只需要将 domain 实例化，并直接访问实例上的属性和函数，如下所示：
```js
import $column from '@domain/dwork/design-column/column';
import $tag from '@domain/dwork/design-column/tag';
import $list from '@presenter/dwork/column-list/list';

@Reactive()
export default class Banner extends React.Component {
  componentDidMount() {
    $list.initLayoutState();
  }

  render() {
    return (
      <React.Fragment>
        <Radio.Group value={$tag.currentTagId} onChange={$list.changeTag}>
          <Radio value="">热门推荐</Radio>
          <For
            each="item"
            index="idx"
            of={$tag.tags}
          >
            <Radio key={idx} value={item.id}>{item.tagName}</Radio>
          </For>
        </Radio.Group>
        <Skeleton
          styleName="column-list"
          when={$column.columnList.length > 0}
          render={<Columns showTag={$tag.currentTagId === ''} data={$column.columnList} />}
        />
        <Pagination
          current={$column.current}
          defaultPageSize={$column.pageSize}
          totalPage={$column.totalPage}
          onChange={$list.changePage}
          hideOnSinglePage={true}
        />
      </React.Fragment>
    );
  }
}
```

当然你也可以把实例挂载到组件的 props 上来向下传递，这个取决于你是如何设计一个复用的业务组件的，以及复用的粒度是怎么样的，挂载到 props 上复用能力无疑是更好的，大部分情况都推荐使用，但如果不使用 ts，这样做也会带来很多麻烦，比如丧失了编辑器的提示和 navigation。

> 你也可以将 Reactive 使用在搭配 react hooks 的函数式组件上，使用方式见快速入门一节

> 任何访问到 domain 状态的组件都必须用 Reactive 修饰，否则不会同步到这个组件

> 如果你只想在父级组件加 Reactive 装饰器，又想同步子组件状态，你就只能通过触发父级组件依赖到的状态的变更来重新渲染引起子组件的重新渲染

在一些有列表的地方，建议父子组件都加上 Reactive 装饰器，这样当只更新列表中某一或某几项时，只会触发对应子组件的重新渲染，不会触发所有组件的重新渲染，这样性能更佳，如下所示：
```js
import $list from '@domain/list';

@Reactive()
export default class List extends React.Component {
  componentDidMount() {
    $list.initLayoutState();
  }

  render() {
    return $list.map(item => (
      <Item data={item} />
    ));
  }
}

@Reactive()
export default class Item extends React.Component {
  render() {
    const { data } = this.props;
    return (
      <div>{data.txt}</div>
    );
  }
}
```

### reactive
```typescript
interface Options {
  name: string;
}
class Reaction {
  name: string;
  runner: Function;
  computed: boolean;
  unsubscribeHandler?: () => void;
  dispose: () => void;
}
type reactive = (func: Function, options?: Options) => Reaction;
```
有些时候我们不想依赖于 react 组件，那么可以使用字母全小写的 reactive 来包裹一个函数使其成为响应式函数，每次更新了该函数依赖到的属性时，该函数会被重新执行一次。reactive 的返回值是一个 Reaction 实例，调用它的 dispose 函数可以销毁这个函数的 reactive 能力，以后就不会再响应变更，并且会做垃圾收集。

### init
```typescript
type init = (callback?: () => void | Promise<void>) => Promise<void> | void
```
`init` 方法是用来做中间件和 store 的初始化，根据配置决定是否加载内置中间件，然后初始化 store，同时也可以传入一个 function，支持异步，可以在这个函数里做初始化状态数据的操作，使用方式如下所示：
```js
(async () => {
  await Turbox.init(async () => {
    const result = await fetchData();
    doUpdate(result);
  });

  ReactDOM.render(
    <App />,
    document.getElementById(mount)
  );
})();
```

> 为什么要放到 init 函数里面做初始化状态操作？原因是需要在 render 之前清理一些由 new、或异步接口产生的不可控的第一次的数据更改记录，只有收到 init 函数里才能集中控制

### middleware
```typescript
type Param = {
  dispatch: (action: DispatchedAction) => any | Promise<any>;
  getActionChain: () => ActionType[];
}
type middleware = (param: Param) => (next) => (action: DispatchedAction) => (action: DispatchedAction) => any | Promise<any>;
type use = (middleware: middleware | middleware[]) => void
```
**turbox** 有一套中间件机制，其中内置了 logger 中间件，logger 默认关闭，在生产环境根据环境变量关闭，是用来打日志的，可以看到变化前后的 reactor state 值，你还可以提供自定义的中间件来触达 action 的执行过程，中间件的写法保留了 **redux** 中间件的写法（参数不太一样），你可以像下面这样使用 use 方法添加中间件：
```js
const middleware = ({ dispatch, getActionChain }) => (next) => (action) => {
  // balabala...
  const nextHandler = next(action); // 注意：返回值可能是个 promise
  if (isPromise(nextHandler)) {
    return new Promise<any>((resolve) => {
      (nextHandler as Promise<any>).then((res) => {
        // peipeipei...
        resolve(res);
      });
    });
  }
  // peipeipei...
  return nextHandler;
}

Turbox.use(middleware);
Turbox.use(otherMiddleware);

Turbox.render(<Layout />, '#app');
```

> use 函数的参数 middleware 可以是一个数组，一次性加载多个中间件，也可以 use 多次，效果和数组是一样的，中间件名称不能重复，否则会报错，注意载入中间件必须先于 Turbox.render 执行

### config
```typescript
type Config = {
  middleware: {
    logger: boolean = false,
    effect: boolean = false,
    perf: boolean = false,
  },
  timeTravel: {
    isActive: boolean = false,
    maxStepNumber: number = 20,
  },
  devTool: boolean = false
}
type config = (config: Config) => void
```
config 函数用来定义全局配置信息，可以开启或关闭中间件、时间旅行器、开发者工具等，传入的配置会覆盖默认配置，使用方式如下所示：
```js
import Turbox from 'turbox';

Turbox.config({
  middleware: {
    logger: true,
  }
});

Turbox.render(<Layout />, '#app');

// 下面是框架提供的默认值
let ctx = {
  middleware: {
    logger: false, // 默认关闭 logger 中间件，在生产环境自动关闭
    effect: false, // 默认关闭 effect 中间件
    perf: false, // 默认关闭 perf 中间件，性能分析用
  },
  timeTravel: {
    isActive: false, // 是否激活时间旅行器
    maxStepNumber: 20, // 记录操作的最大步数
  },
  devTool: false // 默认关闭 devTool，在生产环境自动关闭
}
```

> 必须在 Turbox.render 之前调用

### exception
**turbox** 默认在 Reactive 函数返回的 react 高阶组件中加了 ErrorBoundary 组件来 catch 组件异常，防止整个应用全部崩溃。

### time travelling
框架提供了时间旅行功能，可以做撤销恢复，以及获取是否可以撤销恢复的状态、动态暂停或继续运行时间旅行记录器、清空撤销恢复栈、切换撤销恢复栈等。
```typescript
export class TimeTravel {
  static create: () => TimeTravel;
  static switch: (instance: TimeTravel) => void;
  static pause: () => void;
  static resume: () => void;
  static undo: () => void;
  static redo: () => void;
  static clear: () => void;
  static undoable: boolean;
  static redoable: boolean;
  undoable: boolean;
  redoable: boolean;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}
```
撤销恢复的每一步的定义跟上面章节提到的事务有关

你可以创建多个时间旅行器，并切换应用它，这时相应的操作会自动记录到当前最新被切换的时间旅行器实例中，如果要退出当前的，只要切换到其他旅行器即可
```js
const mainTimeTravel = TimeTravel.create();
TimeTravel.switch(mainTimeTravel);
```

> 时间旅行只会记录每一次变化的信息，而不是整个 snapshot，这样内存占用会更小

> 时间旅行也会记录调用路径的函数名或自定义函数名

## 最佳实践
3d 业务，以单插件为例：
```
├── src
│   ├── api // 接口层，可以做一些防腐
│   ├── assets // 文件资产，全局样式，mixin 等
│   │   ├── images
│   │   └── styles
│   ├── components // 插件内部的公共组件
│   │   ├── 2D
│   │   ├── 3D
│   │   └── web
│   ├── config // 全局配置文件，包括 axios 和主题配置等
│   │   ├── axios
│   │   └── theme
│   ├── const // 存放一些常量和枚举
│   ├── helpers // 帮助函数，一些通用的函数
│   ├── models // 数据层，里面的结构可以自己设计
│   │   ├── scene
│   │   │   ├── custom
│   │   │   ├── mesh
│   │   │   └── molding
│   │   └── web
│   ├── permission // 权限点相关
│   ├── services // 服务层，当前插件对外暴露的方法
│   │   ├── common
│   │   └── search
│   ├── types // 全局声明、ts 常用自定义类型
│   ├── utils // 工具函数，纯函数，可写单测的
│   │   └── __tests__
│   └── views // 视图层
│   │   ├── FunctionPanel
│   │   ├── Scene
│   │   └── TopBar
│   └── plugin.ts // 插件入口文件
```
web 业务：
```
├── @domain // 领域模型层，只关注当前领域模型的操作和职责，可能有互相依赖
│   ├── column.js
│   └── tag.js
├── @api // api 防腐层
│   └── index.js
├── @components // 展示型纯组件或自己维护状态的组件
│   └── design-column
│       ├── index.jsx
│       └── index.scss
└── @blocks // 区块组件，包含状态管理业务逻辑的业务组件
    └── live-list
        ├── index.jsx
        └── index.scss
├── @presenter // 处理呈现层，可以向上组合、调用 domain 层，一般是和视图一一对应的关系，描述每个模块容器组件触发的行为过程以及一些处理
│   └── list.js
│   └── head.js
├── modules // 模块
│   └── list // 列表模块
│   │   ├── index.jsx
│   │   └── index.scss
│   └── head // 头部模块
│       ├── index.jsx
│       └── index.scss
├── Layout.jsx // 最外层的根布局组件，组装各种模块拼合页面
├── README.md
├── entry.js // 入口文件，挂载 Layout 到 dom 上以及做一些初始化操作
├── layout.scss
├── page.json
└── tpl.pug
```

### 如何快速生成 turbox API？
可以在 vscode 插件商店搜索 turbox，下载 turbox snippets 插件，通过一些简单的指令即可快速生成 API，提升开发效率

### 注意事项
避免死循环写法
* 尽量不要在 render 里面触发 mutation，请放到生命周期里
* 尽量不要在 reactive 里面触发 mutation，除非你能保证不会死循环（未改变值被框架拦下来）

这个逻辑跟在 react render 里面不要写 setState 是一样的，容易造成死循环或吞掉一些变更等异常情况，如果没看懂可以先理解数据驱动视图和单向数据流

不同组件形式的生命周期

function component 和 class component 的生命周期执行顺序表现不一致

function component 的表现是：
* batchUpdate 父组件
* 逐个 render 子组件
* hoc didMount
* hoc didUpdate
* 完成 batchUpdate
* 逐个触发子组件 didMount（useEffect 模拟实现）
* 回到第一步

class component 的表现是：
* batchUpdate 父组件
* 逐个 render 子组件
* 逐个触发（子组件 didMount -> hoc didMount）逻辑
* hoc didUpdate
* 完成 batchUpdate
* 回到第一步

主要区别：

function component 并不会等 useEffect 执行，先完成 batchUpdate 再执行 useEffect 逻辑，而 class component 会等生命周期里面的逻辑都执行完，才算执行完这次 batchUpdate

## 框架特性对比
以下简单介绍几个业界比较流行的框架和 **turbox** 框架，让不了解状态管理的童鞋可以快速找到自己适合的框架。

### react-redux
**react-redux** 是比较经典的状态管理框架，最优秀的地方在于可扩展性和可预测性，个人使用感受来说适合一些复杂稳定的业务，并且还是比较考验架构设计的，**redux**（以下代指 **react-redux**） 相对来说还是给了开发者比较多折腾的空间，核心代码不多，扩展能力强，但直接裸用 **redux** 开发链路较长，心智负担较多，效率不算很高。

[如何评价数据流管理框架 redux？](https://www.zhihu.com/question/38591713)

### react-redux 架构图
![redux](https://qhstaticssl.kujiale.com/as/ddae6a4d54ba1e65b5833508fd59ff5c/redux.png)

### dva
**dva** 是基于 **redux** 的状态管理框架，但它不仅仅是个状态管理框架，还捆绑了 cli、router、saga 等能力，配合 **umi** 这套整体解决方案，看起来对于快速搭建应用还不错，它的能力非常强大，集合了多个框架再封装，几乎不怎么再需要添加其他三方库了，不过因为直接依赖了一些三方库，更新维护成本和难度还是挺高的，在社区上不算是很活跃，概念也非常多，适合一些对 redux 系列库比较熟悉的开发者。

[如何评价前端应用框架 dva？](https://www.zhihu.com/question/51831855?from=profile_question_card)

### dva架构图
![dva](https://qhstaticssl.kujiale.com/as/99322f8bdbfcaa47da9ce3cdd5854075/dva.png)

### mobx
响应式数据流的代表 **mobx** 和 **vue** 的写法有相似之处。很多人说，**mobx-react** 是给 **vue** 的狂热粉丝用来写 **react** 的，这个说法很有趣，但在实际普通 web 业务开发中，不可否认它们的写法确实更无脑也更方便，很惊艳也很容易上手，概念也比较少，还是挺适合大部分 web 项目的。不过会比较难测试、难调试，流程复杂的项目自描述能力也比较差，更容易写出过程式代码，扩展和生态都不算是很好，但 mobx 的作者更新还是比较频繁，现在能力也越来越强大了。

[如何评价数据流管理框架 mobx？](https://www.zhihu.com/question/52219898)

### mobx-react架构图
![mobx](https://qhstaticssl.kujiale.com/as/654ae258534c4b8c8f5b21f8f1282e52/mobx.png)

### vuex
**vuex** 是 **vue** 的状态管理框架，整个流程上的理念基本和 **redux** 没有太大区别，主要的区别是在 **vue** 中可以直接更新 state，不需要拷贝，因为这个过程并没有像 reducer 纯函数那样具有明确的输入输出，所以 **vuex** 给它起了个名字，叫做 mutation，因为概念上任何一次相同的输入都得到相同的输出才更符合 reducer 纯函数的特性，所以“突变”更加适合 **vuex** 中的更新行为。

### vuex架构图
![vuex](https://qhstaticssl.kujiale.com/as/e738c068c874a74d0192c83b039980e9/vuex.png)

### turbox
**turbox** 是一个包含了状态管理的大型生产力应用框架，它的灵感主要还是来源于社区和部分复杂业务场景，**turbox** 设计的初衷是想用友好易懂的使用方式满足复杂业务场景，吸收图形与 web 领域的优秀思想，解决复杂通用问题，并提供一些周边工具来进一步提效，尽可能把一些不易改变的决定抽离出来，规范统一大家的代码认知，这就是 **turbox** 框架的意义所在。

- 基于 Proxy 的响应式状态管理
- 支持复杂图状数据结构，而不仅仅是 plain object
- 更好的分层，将数据更新与业务流程隔离
- 中间件系统，让更新流程得以扩展不再黑盒，可以做诸如流程全埋点，线上链路故障排查，性能分析，自动化测试等
- 事务机制，让你更好的合并与记录操作行为
- 内存占用更小更灵活的时间旅行机制，轻松实现撤销恢复、指令流链路跟踪重放等功能
- 丰富的配置，在不同场景下轻松平衡易用与性能
- 默认提供处理副作用的装饰器，对异步场景更友好
- 提供各种描述符，来处理竞态和复杂更新流程（待做）
- 提供了计算属性和属性钩子，来处理复杂计算与特殊场景
- 更加简易的初始化 API，只暴露修改配置的能力
- 完美支持并推荐使用 typescript，没有任何魔法字符串，完备的类型推导，充分利用编辑器的 navigation 与反向依赖分析使开发和维护效率更上一层楼
- 支持 react hooks
- 底层 0 依赖，框架无关，是个纯粹、精简的状态管理解决方案，升级维护都比较容易，不容易腐烂
- 友好的文档和最佳实践，对于没有用过状态管理框架的新手来说，还算比较容易上手

### 为什么不是 redux？
这个应该比较好理解，业界也比较公认它的一些缺点

* 模板代码太多，使用不方便，属性要一个一个 pick，对 ts 也不友好，状态的修改重度依赖 immutable，计算属性要依赖 reselect，还有魔法字符串等一系列问题，心智负担大，用起来很麻烦容易出错，开发效率低下
* 触发更新的效率也比较差，connect 的组件的 listener 必须一个一个遍历，再靠浅比较去拦截不必要的更新，在大型应用里面无疑是灾难
* store 的推荐数据结构是 json object，这对于我们的业务来说也不太合适，我们的数据结构是图状的数据结构，互相有复杂的关联关系，比如父子兄弟层级、环状结构、链式结构、多对多等，比较偏向于后端数据模型，适合用面向对象来描述模型，描述切面，需要多实例隔离，显然用 json 或者 normalizr 强行做只会增加复杂度，和已有的代码也完全无法小成本适配

### 为什么不是 mobx？
* 以前开发该库的时候 mobx 还是基于 defineProperty 来实现的，有很多 hack 的方式，比如监听数组变化等问题的处理，还有很多像监听 Object.keys 这种 API 根本就无法实现，而 tacky 一开始就是基于 proxy 的，我们的业务只要求兼容 chrome，所以就可以用，这样写法会简单很多不需要 hack，支持监听的 API 也会更丰富，当然目前 mobx5 也支持了 proxy。（注意：proxy 在特定浏览器比如 chrome 的性能表现非常优秀，但在 IE Edge 下面性能非常差）
* 然后就是我们需要做一些撤销恢复，mobx 目前只能依赖于 mobx-state-tree 来做，但有非常大的语法成本，需要改数据结构和定义 schema，有点退化成 redux 的感觉。而自己实现的目标主要是为了满足特定业务场景，并在这基础上做针对性优化，而不是做什么通用方案。turbox 的做法是只保存每次修改过的属性的 diff 信息，而不是全量保存，不然内存很容易崩掉。在进入 mutation 前和执行完后，会对修改过的属性记录 beforeUpdate 和 didUpdate 的值，重复修改会被合并掉。不需要人工去写 undo redo，并且提供了丰富的相关能力，以后还会加入更多优化。
* 另外我们需要有一些事务的机制，跟传统 web 一个同步栈或者一个 effect 就是一个事务的视角是不一样的。比如我要画点，画线，再画点，这三个行为才组成了一个事务，要回退是撤销一整个事务，而不是单个行为。另外我们在一些异步并发的场景，需要对事务池做一些调度，比如 abort、revert 掉部分事务。事务的定义就是：一个需要被记录到时间旅行器中的原子操作，我们一次操作可能会产生很多副作用，也可能分发多个 mutation，默认同步的 mutation 会被合并掉，一次性 batchUpdate 组件，用户可以自己定义事务，每个事务会影响撤销恢复的粒度和重新渲染的时机。
* mutation/action 对于渲染时机的把握功能会更丰富，也更灵活，更符合当前业务场景，而 mobx 目前无法满足，仍然是以 web 世界的角度在做 action 机制，无法灵活控制渲染时机
* 另外就是扩展性的问题，我加入了中间件的机制，这样可以侵入 action 的执行过程，相当于一个过滤器一样，可以加入一些内部自定义的埋点、监控、日志中间件，在每次 action 触发的时候可以做很多事情，比如对接全链路排查系统、做自动化测试状态回放等。
* effect 会在近期重写掉，实际上在 3d 业务里面，传统的 effect 概念是个伪命题，它的发展方向应该是异步流，这样对于一些异步竞争比较复杂的场景会比较有用，并且可以简化部分事务的写法。
* 还有就是做了不能在不是 mutation 的地方做更新的机制，强制分离更新数据操作和业务流程，做了一个分层，如果这么做会有抛错，防止数据和视图不同步。当然做这个的意义本质一个是性能考虑批量更新，一个是也会影响事务，再者是职责分离，还有在收口赋值操作，这对重构非常有帮助。
* 最后就是也完美支持 ts 和 react hooks。保证所有的依赖声明都是可以推导和反向依赖分析的。并且没有任何三方依赖，不依赖外部库意味着体积小、性能可控、非常容易维护和升级，腐烂的速度会比较慢一些。包体积很小，gzip 后只有 6.9 k，这还没有让库直接依赖混淆的版本，比如 react，不然应该在 3-5 k左右，是 mobx 体积的一半。

## 性能分析
状态管理部分，turbox 和 mobx 最接近，所以做个性能对比，如下是测试代码：
```js
import { reactor, mutation, Domain, reactive, init, config } from 'turbox';
import { observable, action, autorun } from 'mobx';
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
  @mutation innerDo() {
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
  for (let index = 0; index < 1000; index++) {
    td.do();
  }
  /** 2. 循环放在函数里面 */
  td.innerDo();
  console.dir(performance.memory);
})();
class TestMobx {
  @observable a = {
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
  @action do() {
    this.a.a.a.a.a.a.a += 1;
  }
  @action innerDo() {
    for (let index = 0; index < 1000; index++) {
      this.a.a.a.a.a.a.a += 1;
    }
  }
}
const tm = new TestMobx();
(() => {
  let start, end;
  autorun(() => {
    end = performance.now();
    console.log('mobx:', end - start);
    console.log('mobx:', tm.a.a.a.a.a.a.a);
  });
  start = performance.now();
  /** 1. 多次调用可复用的 action */
  for (let index = 0; index < 1000; index++) {
    tm.do();
  }
  /** 2. 循环放在函数里面 */
  tm.innerDo();
  console.dir(performance.memory);
})();
```

### 测试结果
innerDo：

turbox nextTick 模式：

![innerDo](https://img.alicdn.com/tfs/TB1UY6LQkL0gK0jSZFAXXcA9pXa-502-228.png)

turbox immediately 模式：

![innerDo](https://img.alicdn.com/tfs/TB1m0AKgDM11u4jSZPxXXahcXXa-518-256.png)

mobx：

![innerDo](https://img.alicdn.com/tfs/TB10KDCQXY7gK0jSZKzXXaikpXa-506-258.png)

do：

turbox：

![innerDo](https://img.alicdn.com/tfs/TB1PCPPQkY2gK0jSZFgXXc5OFXa-462-212.png)

mobx：

![innerDo](https://img.alicdn.com/tfs/TB1C3nMQbr1gK0jSZFDXXb9yVXa-492-256.png)

### 结论分析
性能快和慢一定是有原因的，实现机制、功能上的不一样都会造成差异。

如果按照方式 1 来跑，更新 1000 次：turbox 是 13.7 ms，mobx 是 430.9 ms

这是因为 turbox 的视图更新是被 merge 到了 nextTick，所以在一个同步调用栈里面，不会频繁触发重绘，因为当前同步栈执行的中间结果实际上没有重绘的必要，也不应该被重绘，它还没有得到正确的渲染结果。
但 turbox 也支持 keepAlive 渲染，每次调用完 mutation 立即重绘，需要加一些配置参数，因为还是可能会有少数场景追求绝对实时性，由具体业务逻辑来看。

而为什么这种方式 mobx 慢，是因为在 mobx 纯 web 的视角里面，一次 action 执行完就会立即重绘一次，而渲染其实是性能瓶颈，测试代码还特别简单，如果渲染逻辑复杂 mobx 会更慢。实际上，mobx 的表现是正常的，要解决这个问题，只需要把循环逻辑本身放到一个 action 里面，就会被合并：
```js
@action
do() {
  this.a.a.a.a.a.a.a += 1;
}
@action
loopDo() {
  for (let index = 0; index < 1000; index++) {
    tm.do();
  }
}
```
这样就快了，没错，这样的确是快了，但是每次要多写一个包裹函数，而且需要时刻注意 action 的概念。而 mutation 没有这个限制，可以单独调用，也可以组合调用。

如果按照方式 2 来跑，更新 1000 次：turbox nextTick 模式是 9.7 ms，immediately 模式是 9.2 ms，mobx 是 7.3 ms

这是符合预期的，因为 turbox 带有撤销恢复和中间件执行的开销（即使关闭了也有），再加上是在 nextTick 重绘的，理论上是不可能比 mobx 快的，因为换取了其他优势，但是随着更新的属性越多，效率倍数上差距会越来越小，再加上 turbox 对代理的属性做了缓存，理论上重复修改深层节点会越来越快。

虽然这种情况下没有 mobx 快，但是 turbox 还是做到了该有的性能优化的：
* 在依赖收集与依赖回收的地方也有做一些优化，默认是会惰性的在访问属性的时候才会把依赖收集进去。每次重新渲染后会删除无用依赖减少内存消耗，提高更新检测时的效率，这里面用了类似新生代老生代的算法，把原本需要在重新渲染之前用 O(n2) 算法暴力清除依赖再重建依赖的方式，简化成了用标记新老节点的方式，不阻塞当次渲染，并且可重复利用已有缓存，在渲染完成之后再对老生代做垃圾收集。
* 对代理过的嵌套对象也会做缓存。依赖收集的高效主要体现在更新，但依赖收集本身是有性能开销的，在初始化的时候实际上要比类 redux 框架要多占一些内存和时间的。

关于异步 action 的性能问题
```js
@action
do() {
  this.a.a.a.a.a.a.a += 1;
}
@action
async loopDo() {
  for (let index = 0; index < 1000; index++) {
    tm.do();
  }
  await wait(2000);
  for (let index = 0; index < 1000; index++) {
    tm.do();
  }
}
```
mobx 会先渲染一次，这个好理解，等待 2 秒后，却重绘了 1000 次：
前面 1000 次只花了 10.39 ms（异步下性能下降了，turbox 是 9.7 ms）

![innerDo](https://img.alicdn.com/tfs/TB10nvIQeH2gK0jSZJnXXaT1FXa-404-88.png)

第 2000 次 - 第 1001 次的时间 = 248 ms

![innerDo](https://img.alicdn.com/tfs/TB13pzLQoY1gK0jSZFCXXcwqXXa-428-86.png)

![innerDo](https://img.alicdn.com/tfs/TB1KqnLQoY1gK0jSZFCXXcwqXXa-392-84.png)

对的，你没看错，即使在外部包裹了 action，也只会对当前宏任务（macro task）做合并，但对 await 后面的执行却无法合并，这跟 mobx 同步渲染的机制其实有关系，实际上只能通过其他办法来做合并，直接这么写是实现不了的。但是 turbox 可以。

turbox 的机制其实更符合原生体验，灵感来源于 react 和 vue
* 调用一个 mutation 渲染一次，mutation 可以嵌套，以最外层的调用结束为准重渲染一次，同步的 mutation 就跟同步的函数一样，即使不用包裹也会被自动合并。
* 如果需要调用完 mutation 立即重绘也可以支持
* 异步的调用可以直接用普通的 async 函数去调用 mutation，也可以做到 web 场景类似”side effect“概念的天然支持，但开发者却可以不用去理解副作用是什么概念
* 如果有些场景想等整个异步函数结束才去渲染一次，可以使用异步的 mutation，这样就会阻止掉出现”side effect“的情况

综上来看，turbox 的机制在性能和功能覆盖度的权衡上会更贴合现有业务场景，实际上 web 场景根本遇不到这么复杂的情况，mobx 也完全可以胜任（不考虑中间件和时间旅行），但在 3d 场景，哪怕是结合 web 技术的时候，差异还是很大的
