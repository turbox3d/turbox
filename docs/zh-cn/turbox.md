# Turbox

[![build status](https://img.shields.io/travis/com/turbox3d/turbox/master.svg?style=flat-square)](https://travis-ci.com/github/turbox3d/turbox)
[![license](https://img.shields.io/github/license/turbox3d/turbox?style=flat-square)](https://travis-ci.com/github/turbox3d/turbox)
[![npm version](https://img.shields.io/npm/v/turbox.svg?style=flat-square)](https://www.npmjs.com/package/turbox)
[![npm downloads](https://img.shields.io/npm/dm/turbox.svg?style=flat-square)](https://www.npmjs.com/package/turbox)
[![install size](https://img.shields.io/bundlephobia/minzip/turbox?style=flat-square)](https://www.npmjs.com/package/turbox)

## 介绍
**turbox**（涡轮）是一个适合大型生产力单页软件应用的前端框架，场景来源于复杂大型 3D 业务

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
  updateLink(prevLine: Line, nextLine?: Line) {
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
        <span>{JSON.stringify($line.start.position)}</span>
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
      <span>{JSON.stringify($line.start.position)}</span>
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

> 本框架必须使用 decorator，你需要安装 transform-decorators-legacy, transform-class-properties, babel7 的话用 @babel/plugin-proposal-decorators

### 依赖
**turbox** 依赖 **react-dom, react 16或以上版本**

### 兼容性
**turbox** 支持大部分现代浏览器，由于使用了 Proxy API，在 IE 和一些低版本浏览器下不支持，还使用了 Reflect、Symbol、Promise、Map、Set API，如需兼容需要自行引入 polyfill

## API & 概念

### Domain
在 **turbox** 中，我们推荐使用面向对象的写法来组织我们的代码，这在一些复杂中大型单页应用中是比较有利的，以往我们在做一些简单的 web 页面时通常把状态设计成一颗尽量扁平化的树就已经够用了，甚至函数式的写法似乎也不错，而在中大型单页 3D 应用和其他的一些复杂应用中，数据模型往往是一个非常复杂的图状数据结构，这就要求我们可以把复杂的状态设计成一个个合理的数据模型单元，每个模型都拥有自己的一系列业务逻辑和与其他数据模型之间的一些关系，最后构成图状模型。

domain 我们称之为一个领域模型，实际上它就是一个增强父类，把你的普通数据模型升级成为一个响应式的领域模型，其中可能包含 reactor、effect、mutation 等装饰器修饰的属性和函数，也有可能包含构造函数、成员变量等 class 本身所具有的特性。

不管是 store 还是 domain，只是一种概念，本质上它们都是为了从视图层中剥离业务逻辑，并且得到一定程度的解耦、复用和互相依赖，至于如何设计，这就是使用者的事情了，你可以采用 VIPER、ECS、MVP、传统 MVC 架构或是其他的设计思想来组织你的应用，甚至如果你的业务场景真的具有领域模型这个概念，并且在后端和产品层面都可以遵守领域模型，那也可以尝试设计成领域模型架构，如果不存在，仅仅是单纯业务逻辑的剥离也未尝不可，框架并不限制这些。不过 **turbox** 还是会提供一份最佳实践的设计，在文档最后，仅供参考。

如下代码所示，这就是一个 domain，其实就是一个普通的 class 继承了 **turbox** 提供的 Domain 父类：
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

每个 domain 都可以拥有多个实例，不同实例之间的状态是隔离的，完全的面向对象。但在大部分模型不复杂的前中后台多页 web 应用中，通常它是单例的，因为只是用来存储几个零散的交互状态，状态模型并不复杂，甚至函数式更好，使用者自行根据业务场景选择合适的框架，并进行合理的设计。
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

> Domain 的子类可以实现一个 initDomainContext 方法，该方法用来声明 Domain 的 context，目前只有 isNeedRecord 属性，用来标记这个类所有响应式属性是否需要记录到撤销恢复栈中

### reactor
在 **mobx** 中，会用 @observable 的装饰器来表示这是一个响应式状态属性，而在 **turbox** 中，通过 @reactor 的装饰器来声明，如下代码所示：
```js
export class MyDomain extends Domain {
  @reactor isLoading = false;
  @reactor() list = [];
  @reactor(true, true, function(target, property) {}) prop = 'prop';
}
```

> reactor 装饰器可以加括号传参，也可以不加括号不传参，框架都支持，其他装饰器比如 mutation、effect、reactive 同理

> reactor 装饰器有三个参数，第一个参数是 deepProxy，用来表示是否需要深度代理，默认开启，这样可以支持深层 mutable 的写法，默认也会对数据结构做性能优化，如果关闭，则需要通过拷贝赋值的方式来触发更新，或者其他 immutable 的方式，否则不会触发更新。

> 第二个参数是 isNeedRecord，表示该属性是否需要被记录到时间旅行器中，该属性可以覆盖掉 domain context 里的配置。

> 第三个参数是个 callback 回调，当该属性被使用（get）时，该函数会被触发，该回调有两个参数，第一个参数是 target 对象，第二个参数是被使用时的属性 key，如果访问的是深层次节点则 target 指代的是当前深层次的访问对象，property 则为深层次使用时的属性 key，应该尽量避免使用该回调，可能会造成死循环，只在一些极特殊场景使用。

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

> 在属性已经被视图层观察后，你只能在 mutation 中直接对属性赋值或使用 $update 来更新数据，在其他函数中直接对 reactor 修饰过的属性赋值会得到一个错误，You cannot update value to observed \'@reactor property\' directly. Please use mutation or $update({})，这是为了防止非法操作导致状态和视图不同步的情况出现

> 在传统 web 应用中，状态通常是设计成一棵较为扁平化的树，每个 domain 的 mutation 只关心当前 domain 的 reactor state，不关心其他 domain 的 reactor state，如果有关联多使用组合而非继承或图状关系，但数据模型稍微复杂一些的业务，仅仅使用组合难以满足需求，现实情况可能就是存在父子或兄弟关系，也必然伴随着一个 mutation 会同时操作当前 domain 和其他关联 domain 的情况，这种情况只要保证在 mutation 调用范围内，即便对其他 domain 的 reactor state 直接赋值也不会抛错

### action
`action` 通常是用来灵活控制操作行为的 api，可以简单的理解为一种事务的机制，会影响撤销恢复的粒度。比如我们可以定义如下的一个 action：
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
type init = () => void
```
`init` 方法是用来做中间件和 store 的初始化，根据配置决定是否加载内置中间件，然后初始化 store，使用方式如下所示：
```js
Turbox.init();

ReactDOM.render(
  <App />,
  document.getElementById(mount)
);
```

### middleware
```typescript
type Param = {
  dispatch: (action: DispatchedAction) => any | Promise<any>;
}
type middleware = (param: Param) => (next) => (action: DispatchedAction) => (action: DispatchedAction) => any | Promise<any>;
type use = (middleware: middleware | middleware[]) => void
```
**turbox** 有一套中间件机制，其中内置了 logger 中间件，logger 默认关闭，在生产环境根据环境变量关闭，是用来打日志的，可以看到变化前后的 reactor state 值，你还可以提供自定义的中间件来触达 action 的执行过程，中间件的写法保留了 **redux** 中间件的写法（去掉了 getState），你可以像下面这样使用 use 方法添加中间件：
```js
const middleware = ({ dispatch }) => (next) => (action) => {
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

## 最佳实践

### 架构图
![framework](https://qhstaticssl.kujiale.com/as/2232c5fc6a39cc05732ad9fd7a99703a/bp-framework.png)

### 目录结构设计
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

### 如何设计 Presenter（处理呈现层）
view 层中尽可能只定义事件行为，不要做过多业务逻辑，尽可能丢到处理呈现层来进行，如下代码所示是 list 模块的 presenter：
```js
import $column from '@domain/dwork/design-column/column';
import $list from '@presenter/dwork/column-list/list';
// 在视图中只定义行为，一目了然
@Reactive()
export default class List extends React.PureComponent {
  componentDidMount() {
    $list.initLayoutState();
  }

  render() {
    return (
      <>
        <Radio.Group onChange={(id) => $list.changeTag(id)}></Radio.Group>
        <Pagination
          current={$column.current}
          defaultPageSize={$column.pageSize}
          totalPage={$column.totalPage}
          onChange={(page) => $list.changePage(page)}
          hideOnSinglePage
        />
      </>
    );
  }
}

// 在 presenter 中实现好这个行为的流程和业务逻辑
import { getQuery, updateQuery } from '@util/url-tool';
import $column from '@domain/dwork/design-column/column';
import $tag from '@domain/dwork/design-column/tag';

export default class ListPresenter {
  async changePage(page) {
    $column.updateColumnListPage(page);
    updateQuery({
      page,
    });
    $column.fetchColumnListFromRemote({
      page,
      tagId: $tag.currentTagId
    });
  }

  async changeTag(id) {
    $column.updateColumnListPage(1);
    $tag.updateCurrentTagId(id);
    updateQuery({
      page: 1,
      tagid: id
    });
    $column.fetchColumnListFromRemote({
      page: 1,
      tagId: id
    });
  }

  async initLayoutState() {
    const { page = 1, tagid = '' } = getQuery();
    $column.updateColumnListPage(page);
    $tag.updateCurrentTagId(tagid);
    $tag.fetchTagsFromRemote();
    $column.fetchColumnListFromRemote({ page, tagId: tagid });
  }
}
```

还可以做一些异步任务的流程控制，将来还会加入 operator
```js
export default class Presenter {
  async initLayoutStateRace() {
    const { page = 1, tagid = '' } = getQuery();
    this.$tag.updateCurrentTagId(tagid);
    // 此时 tagId 是更新后的值
    await Promise.race([
      this.$tag.fetchTagsFromRemote(),
      this.$column.fetchColumnListFromRemote({ page, tagId: tagid })
    ])
    // 此时上面更新过的 state 都是最新的
    this.$column.updateColumnListPage(page);
  }

  async initLayoutState() {
    const { page = 1, tagid = '' } = getQuery();
    this.$tag.updateCurrentTagId(tagid);
    await Promise.all([
      this.$tag.fetchTagsFromRemote(),
      this.$column.fetchColumnListFromRemote({ page, tagId: tagid })
    ])
    this.$column.updateColumnListPage(page);
  }

  async initLayoutStateSync() {
    const { page = 1, tagid = '' } = getQuery();
    this.$tag.updateCurrentTagId(tagid);
    this.$column.updateColumnListPage(page);
  }
}
```

### 如何设计 API 防腐层
这一层主要是和后端的数据结构隔离，让前端关注前端的数据结构，如果后端字段改了只需要在这一层调整，不需要一层一层改下去：
```js
import API from '@util/ajax-tool';

export async function fetchColumnList({ page, num, tagId }) {
  const { designColumnVos, totalPages } = await API.get('/api/list',
    { page, num, tagid: tagId });
  return {
    columnList: designColumnVos,
    totalPage: totalPages,
  };
}

export async function fetchCategoryTags() {
  const { c, d } = await API.get('/api/tag');
  if (c === '-1') {
    return {
      tags: [],
    };
  }
  // 或者修改一些数组中的字段值以满足组件需要的参数
  return {
    tags: d && d.l,
  };
}
```

### 如何初始化一个 Turbox 项目
仅仅调用 render 函数就可以，如下所示：
```js
// entry.js
import React from 'react';
import Turbox from 'turbox';
import Layout from './Layout';

async function main() {
  // 全局配置信息
  Turbox.config({
    middleware: {
      logger: true,
    }
  });
  // 载入中间件
  Turbox.use(middleware);
  // 渲染
  Turbox.render(<Layout />, '#app', async () => {
  });
}

main();
```

### 如何动态初始化 domain 的状态值
```js
import $column from '@domain/design-column'; // $column 是一个实例
import Point from '@domain/point'; // Point 是一个 class

let $point;
async function main() {
  const obj = await API.getRemoteData();
  // 可以在渲染之前修改状态值
  $column.$update(obj);
  $point = new Point('1,1');
  // 渲染
  Turbox.render(<Layout />, '#app', async () => {
  });
}

main();

export const store = {
  $point,
};
```

### 如何链接模型和组件
下面是一个简单的例子，详情请见上面的 API & 概念：
```js
import { Reactive } from 'turbox';
import $column from '@domain/dwork/design-column/column'; // 导出的是一个实例
import $list from '@presenter/dwork/column-list/list'; // 导出的是一个实例

@Reactive() // 标记需要自动同步状态
export default class List extends React.PureComponent {
  componentDidMount() {
    $list.initLayoutState();
  }

  render() {
    return (
      <>
        <Radio.Group onChange={(id) => $list.changeTag(id)}></Radio.Group>
        <Pagination
          current={$column.current}
          defaultPageSize={$column.pageSize}
          totalPage={$column.totalPage}
          onChange={(page) => $list.changePage(page)}
          hideOnSinglePage
        />
      </>
    );
  }
}
```

## 框架特性对比
以下简单介绍几个业界比较流行的框架和 **turbox** 框架，让不了解状态管理的童鞋可以快速找到自己适合的框架。

### react-redux
**react-redux** 是比较经典的状态管理框架，最优秀的地方在于可扩展性和可预测性，个人使用感受来说适合一些复杂稳定的业务，并且还是比较考验架构设计的，**redux**（以下代指 **react-redux**） 相对来说还是给了开发者比较多折腾的空间，核心代码不多，扩展能力强，但直接裸用 **redux** 开发链路较长，心智负担较多，效率不算很高。

[如何评价数据流管理框架 redux？](https://www.zhihu.com/question/38591713)

### react-redux 架构图
![redux](https://qhstaticssl.kujiale.com/as/ddae6a4d54ba1e65b5833508fd59ff5c/redux.png)

### dva
**dva** 是基于 **redux** 的状态管理框架，但它不仅仅是个状态管理框架，还包含了 cli、router 等能力，配合 **umi** 这套整体解决方案，看起来对于快速搭建应用还不错，它的能力非常强大，集合了多个框架再封装，几乎不怎么再需要添加其他三方库了，不过因为直接依赖了一些三方库，更新维护成本和难度还是挺高的，在社区上不算是很活跃，概念也非常多，适合一些对 redux 系列库比较熟悉的开发者。

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
