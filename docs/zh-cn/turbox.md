# Turbox

[![build status](https://img.shields.io/travis/com/turbox3d/turbox/master.svg?style=flat-square)](https://travis-ci.com/github/turbox3d/turbox)
[![license](https://img.shields.io/github/license/turbox3d/turbox?style=flat-square)](https://travis-ci.com/github/turbox3d/turbox)
[![npm version](https://img.shields.io/npm/v/@turbox3d/turbox3d?style=flat-square)](https://www.npmjs.com/package/@turbox3d/turbox3d)
[![npm downloads](https://img.shields.io/npm/dm/@turbox3d/turbox3d?style=flat-square)](https://www.npmjs.com/package/@turbox3d/turbox3d)
[![install size](https://img.shields.io/bundlephobia/minzip/@turbox3d/turbox3d?style=flat-square)](https://www.npmjs.com/package/@turbox3d/turbox3d)

## 介绍
**turbox**（涡轮）的定位是大型 web 图形业务应用的前端框架，CAX 应用开箱即用的引擎及库。场景主要来源于大型 web 3d 设计制造一体化编辑器业务。

turbox 框架包含几个子框架：
* 响应式数据流事务框架（有框架无关的核心部分及 for react 的版本）
* 指令管理框架
* 事件交互管理框架
* 视图渲染框架（有引擎无关的核心部分及 2d for pixi、3d for three 的实现，renderer-* 对应的无 react 依赖的渲染框架，graphic-view-* 是使用 react 来渲染的视图框架）
* 设计引擎（类 web CAX 应用的通用引擎及库）
* 基于 three 扩展的数学库，主要是一些常用几何算法和容差的支持
* 基于视图框架封装的 CAX 常用图形控件，比如尺寸标注、Gizmo 等
* 生产智造引擎（在设计引擎和公式约束求解引擎上的一层封装，闭源）

## API 手册
[API 手册](https://turbox3d.github.io/turbox-type-doc/)

## 在线示例
<div style="display: flex; align-items: center;">
  <img width="20" height="20" src="https://img.alicdn.com/imgextra/i4/O1CN01pY750m1qZAcltAZeo_!!6000000005509-2-tps-200-200.png" />
  <a style="margin-left: 6px;" href="https://codesandbox.io/s/turbox-demo-forked-48s2t">Turbox Online Demo</a>
</div>

## 谁在使用
<div style="display: flex; align-items: center;">
  <img width="92" height="38" src="https://img.alicdn.com/imgextra/i2/O1CN01JJDzEQ1JXuD4kQApO_!!6000000001039-2-tps-184-76.png" />
  <img style="margin-left: 30px;" width="42" height="42" src="https://img.alicdn.com/imgextra/i3/O1CN01CfwNBY1ZuNUksgIiC_!!6000000003254-2-tps-160-160.png" />
  <img style="margin-left: 30px;" width="42" height="42" src="https://img.alicdn.com/imgextra/i2/O1CN01Yc7aDt1NmL9kqPxEW_!!6000000001612-2-tps-144-144.png" />
</div>

## 响应式数据流事务框架
### 架构图
![framework](https://img.alicdn.com/tfs/TB1fRl5g79l0K4jSZFKXXXFjpXa-2231-1777.png)

### 快速上手
一个最简单的例子：
```js
// line.js
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
import Point from './point';
import Line from './line';

const p1 = new Point(new Point2d(1, 1));
const p2 = new Point(new Point2d(2, 2));
const $line = new Line(p1, p2);

@ReactiveReact()
export default class extends React.Component {
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
import Point from './point';
import Line from './line';

const p1 = new Point(new Point2d(1, 1));
const p2 = new Point(new Point2d(2, 2));
const $line = new Line(p1, p2);

const Layout = ReactiveReact(() => {
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

// render graphic component without react
@Reactive
class GraphicComponent extends Component {
  render() {
    return [{
      component: A,
      props: {},
      key: '',
    }];
  }
}

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

### 使用说明

#### 安装
```
$ npm install --save @turbox3d/turbox3d

$ yarn add @turbox3d/turbox3d
```

> 本框架有依赖 decorator，你需要安装 transform-decorators-legacy, transform-class-properties, babel7 的话用 @babel/plugin-proposal-decorators

#### 兼容性
**turbox** 支持大部分现代浏览器，由于使用了 Proxy API，在 IE 和一些低版本浏览器下不支持，还使用了 Reflect、Symbol、Promise、Map、Set API，如需兼容需要自行引入 polyfill

### API & 概念
#### reactor
在 **mobx** 中，会用 @observable 的装饰器来表示这是一个响应式状态属性，而在 **turbox** 中，通过 @reactor 的装饰器来声明，这样框架就能代理掉属性的 getter、setter 等操作，如下代码所示：
```js
export class MyDomain extends Domain {
  @reactor isLoading = false;
  @reactor() list = [];
  @reactor(true, true, function(target, property) {}) prop = 'prop';
}
```

有时候我们想使用函数式的 API，可以这么做：
```js
// plain object
const obj = reactor<ObjInterface>({
  test: {
    a: 111111,
    b: 222222,
  },
  xxx: 'reactor xxx',
});
// 数组
const array = reactor<Array<string>>(['111']);
// 集合 Map、Set、WeakMap、WeakSet
const map = reactor<Map<string, string>>(new Map());

reactive(() => {
  console.log(rct.test.a);
});
```

> reactor 装饰器可以加括号传参，也可以不加括号不传参，框架都支持，其他装饰器比如 mutation、action、Reactive 同理

> reactor 装饰器有三个参数，第一个参数是 deepProxy，用来表示是否需要深度代理，默认开启，这样可以支持深层 mutable 的写法，默认也会对数据结构做性能优化，如果关闭，则需要通过拷贝赋值的方式来触发更新，或者其他 immutable 的方式，否则不会触发更新。

> 第二个参数是 isNeedRecord，表示该属性是否需要被记录到时间旅行器中，该属性可以覆盖掉 domain context 里的配置。

> 第三个参数是个 callback 回调，当该属性被使用（get）时，该函数会被触发，该回调有两个参数，第一个参数是 target 对象，第二个参数是被使用时的属性 key，如果访问的是深层次节点则 target 指代的是当前深层次的访问对象，property 则为深层次使用时的属性 key，应该尽量避免使用该回调，可能会造成死循环，只在一些极特殊场景使用。

> 支持基本数据类型、数组、对象、自定义 class 的实例、domain 的实例、Map、Set、WeakMap、WeakSet

**turbox** 在几年前就已经坚持使用 Proxy 来做数据代理了，那时候主流的响应式状态框架还都是采用 hack 的方式，因为当时我们的业务只需要支持 chrome，而 web 页面通常需要考虑很多兼容性问题。用 Proxy 可以让代码变得更简单，也支持更多数据结构和方法的截持。

首先，我们不会对一个 class 的所有属性做代理，肯定只是对装饰器修饰的那些属性做代理，并且不会干扰 class 本身的作用，所以在第一层级依然是通过 Object.defineProperty 来实现属性代理：
```typescript
const newDescriptor = {
  enumerable: true,
  configurable: true,
  get: function () {
    const current = (this as Domain);
    if (config.callback) {
      const f = () => {
        meta.freeze = true;
        config.callback && config.callback.call(current, current, property);
        meta.freeze = false;
      };
      !meta.freeze && f();
    }
    return current.propertyGet(property, config);
  },
  set: function (newVal: any) {
    const current = (this as Domain);
    current.propertySet(property, newVal, config);
  },
};
```

如果代理的数据是一个基本数据类型，则把原来的值返回即可，如果代理的值是一个特殊的对象（包括数组、集合类型、plain object、自定义 class 实例）则需要特殊处理，如下所示：
```ts
propertyGet(key: string, config: ReactorConfig) {
  const v = this.properties[key];
  const mergedConfig = Object.assign({}, {
    isNeedRecord: this.context.isNeedRecord,
  }, config);
  this.reactorConfigMap[key] = mergedConfig;

  depCollector.collect(this, key);

  return isObject(v) && !isDomain(v) && mergedConfig.deepProxy ? this.proxyReactive(v, key) : v;
}
```

我们可以看到，如果是特殊对象，我们才使用 Proxy 来做代理，它能截持到哪些事情：
* 比如集合类型的 set，get，delete 方法
* 数组的 push，pop，unshift，shift
* 给一个对象不存在的属性赋值、删属性
* 对象的深层修改的代理
* 一些其他特殊 API，如 new 操作符、Object.keys() 等等

大家都知道 Proxy 可以截持很多原生 API 的动作，但是实际上要支持各种数据结构和场景，并没有想象的那么容易。

比如 Proxy 也一样只会支持第一级 get key 的代理，如果要支持深层属性的依赖收集和代理，必须得使用递归，当然这个过程是它每次被 get 的时候才会做，并且需要做对应的双缓冲机制，防止重复创建 proxy 实例：
```ts
private proxyReactive(raw: object, rootKey: string) {
  const _this = this;
  rootKeyCache.set(raw, rootKey);
  // different props use same ref
  const refProxy = rawCache.get(raw);
  if (refProxy !== void 0) {
    return refProxy;
  }
  // raw is already a Proxy
  if (proxyCache.has(raw)) {
    return raw;
  }
  if (!canObserve(raw)) {
    return raw;
  }
  const proxyHandler: ProxyHandler<object> = includes(collectionTypes, raw.constructor) ? {
    get: bind(_this.collectionProxyHandler, _this),
  } : {
    get: bind(_this.proxyGet, _this),
    set: bind(_this.proxySet, _this),
    ownKeys: bind(_this.proxyOwnKeys, _this),
    deleteProperty: bind(_this.proxyDeleteProperty, _this),
  };
  const proxy = new Proxy(raw, proxyHandler);
  proxyCache.set(proxy, raw);
  rawCache.set(raw, proxy);

  return proxy;
}

private proxyGet(target: any, key: string, receiver: object) {
  const res = Reflect.get(target, key, receiver);
  const rootKey = rootKeyCache.get(target)!;

  depCollector.collect(target, key);
  if (this.reactorConfigMap[rootKey].callback) {
    const f = () => {
      meta.freeze = true;
      this.reactorConfigMap[rootKey].callback && this.reactorConfigMap[rootKey].callback.call(this, target, key);
      meta.freeze = false;
    };
    !meta.freeze && f();
  }

  return isObject(res) && !isDomain(res) ? this.proxyReactive(res, rootKey) : res;
}
```
再比如数组的场景，数组你可以理解为一个以下标为 key 的对象，还会多个 length 的内置属性，深度使用过 Proxy 的童鞋应该知道，操作数组的时候，截持的 key 其实就是数组的当前 index，但还不算完，如果影响到了 length 的大小，你会发现当前这个 Proxy 的 set 会被触发两次，所以在结合具体的框架逻辑时候，你得考虑到这种情况，不然会引起一些 bug。

我们要考虑一种情况，当一个属性不存在的时候，如果此时做了一个赋值，我们不仅仅需要触发该属性的 set，还需要同时触发 add，思考一下为什么？

因为我们在使用这个属性的时候，不一定是通过 get 的方式，也许是通过 Object.keys 遍历，或者直接使用目标对象的情况，显然这时候的 set 不仅仅会影响到该 key 的改变，还会影响到上述说的这些情况的改变，所以我们在做依赖收集的时候，需要收集这些遍历的情况，触发的时候可以 match 上。

再来看看集合类型，集合类型本身并没有对应的 Proxy API 可以代理到，比如对一个 map 做代理，你只能 get 到对应 map 的方法名，不过那也足够了，我们只要知道对应的方法名，就可以做一个映射，调用它原型上的真实 API，并且做对应的依赖收集和触发收集：
```ts
getCollectionHandlerMap = (target: Collection, proxyKey: string) => {
  return {
    get size() {
      const proto = Reflect.getPrototypeOf(target);
      depCollector.collect(target, ESpecialReservedKey.ITERATE);
      return Reflect.get(proto, proxyKey, target);
    },
    get: (key: any) => {
      const { get } = Reflect.getPrototypeOf(target) as MapType;
      depCollector.collect(target, key);
      return get.call(target, key);
    },
    has: (key: any) => {
      const { has } = Reflect.getPrototypeOf(target) as NormalCollection;
      depCollector.collect(target, key);
      return has.call(target, key);
    },
    forEach: (callbackfn: (value: any, key: any, map: Map<any, any>) => void) => {
      const { forEach } = Reflect.getPrototypeOf(target) as NormalCollection;
      depCollector.collect(target, ESpecialReservedKey.ITERATE);
      return forEach.call(target, callbackfn);
    },
    values: () => {
      const { values } = Reflect.getPrototypeOf(target) as NormalCollection;
      depCollector.collect(target, ESpecialReservedKey.ITERATE);
      return values.call(target);
    },
    keys: () => {
      const { keys } = Reflect.getPrototypeOf(target) as NormalCollection;
      depCollector.collect(target, ESpecialReservedKey.ITERATE);
      return keys.call(target);
    },
    entries: () => {
      const { entries } = Reflect.getPrototypeOf(target) as NormalCollection;
      depCollector.collect(target, ESpecialReservedKey.ITERATE);
      return entries.call(target);
    },
    [Symbol.iterator]: () => {
      if (target.constructor === Set) {
        return this.getCollectionHandlerMap(target, 'values').values();
      }
      if (target.constructor === Map) {
        return this.getCollectionHandlerMap(target, 'entries').entries();
      }
    },
    add: (value: any) => {
      const { add, has } = Reflect.getPrototypeOf(target) as SetType;
      const rootKey = rootKeyCache.get(target)!;
      const hadValue = has.call(target, value);

      if (!hadValue) {
        triggerCollector.trigger(target, value, {
          type: ECollectType.SET_ADD,
          beforeUpdate: undefined,
          didUpdate: value,
        }, this.reactorConfigMap[rootKey].isNeedRecord);

        triggerCollector.trigger(target, ESpecialReservedKey.ITERATE, {
          type: ECollectType.SET_ADD,
        }, this.reactorConfigMap[rootKey].isNeedRecord);
      }

      return add.call(target, value);
    },
    set: (key: any, value: any) => {
      const { set, get, has } = Reflect.getPrototypeOf(target) as MapType;
      const rootKey = rootKeyCache.get(target)!;
      const hadKey = has.call(target, key);
      const oldValue = get.call(target, key);

      if (value !== oldValue) {
        triggerCollector.trigger(target, key, {
          type: ECollectType.MAP_SET,
          beforeUpdate: oldValue,
          didUpdate: value,
        }, this.reactorConfigMap[rootKey].isNeedRecord);
      }
      if (!hadKey) {
        triggerCollector.trigger(target, ESpecialReservedKey.ITERATE, {
          type: ECollectType.MAP_SET,
        }, this.reactorConfigMap[rootKey].isNeedRecord);
      }
      return set.call(target, key, value);
    },
    delete: (key: any) => {
      const proto = Reflect.getPrototypeOf(target) as Collection;
      const rootKey = rootKeyCache.get(target)!;
      const hadKey = proto.has.call(target, key);

      if (!hadKey) {
        return proto.delete.call(target, key);
      }

      if (proto.constructor === Map || proto.constructor === WeakMap) {
        const oldValue = proto.get.call(target, key);
        triggerCollector.trigger(target, key, {
          type: ECollectType.MAP_DELETE,
          beforeUpdate: oldValue,
        }, this.reactorConfigMap[rootKey].isNeedRecord);

        triggerCollector.trigger(target, ESpecialReservedKey.ITERATE, {
          type: ECollectType.MAP_DELETE,
        }, this.reactorConfigMap[rootKey].isNeedRecord);
      }
      if (proto.constructor === Set || proto.constructor === WeakSet) {
        triggerCollector.trigger(target, key, {
          type: ECollectType.SET_DELETE,
          beforeUpdate: key,
        }, this.reactorConfigMap[rootKey].isNeedRecord);

        triggerCollector.trigger(target, ESpecialReservedKey.ITERATE, {
          type: ECollectType.SET_DELETE,
        }, this.reactorConfigMap[rootKey].isNeedRecord);
      }

      return proto.delete.call(target, key);
    },
    clear: () => {
      const { clear, forEach } = Reflect.getPrototypeOf(target) as NormalCollection;
      forEach.call(target, (value: any, key: any) => {
        this.getCollectionHandlerMap(target, key).delete(key);
      });

      return clear.call(target);
    },
  }
}

private collectionProxyHandler(target: Collection, key: string) {
  const handlers = this.getCollectionHandlerMap(target, key);
  const targetObj = key in target && handlers[key] ? handlers : target;
  return Reflect.get(targetObj, key);
}
```

#### mutation
在 **redux** 中，我们写的最多的就是 reducer，它是用来处理数据更新操作，传统意义来说，reducer 是一个具有输入输出的纯函数，它更像是一个物料，或是一个早就定制好的流水线，任何相同的输入，一定会得到相同的输出，它的执行不会改变它所在的环境，外部环境也不应该影响它，这种特性似乎非常适合 **react** 数据状态机的思想，每一个 snapshot 都对应着一份数据，数据变了，就产生了新的 snapshot。

在 **mobx** 中，没有 reducer，它从另一个思想，响应式编程的角度来试图解决状态的传递，本质上对原始引用做了一份代理，任何一次更新都会直接反馈到原始引用，并广播到所有依赖过的地方并触发它们，类似 **vuex** 中的 mutation 的概念，它是一种突变，不是一个纯函数。

从关注点精度来说，**mobx** 是属性级别的，而 **redux** 是某个容器的全局状态机，**redux** 虽然可以通过 combine 来降低关注点，但使用上配合 **immutable** 还是比 **mobx** 要麻烦一些，易用性上这一点 **mobx** 更好，只需要关注对应的属性。但精度过细也有缺点，比如我需要做一组操作的状态回退，或是自描述一套流程，就比较难直接快速的看出来，不过 **mobx** 后来也有了 action 的概念，不过必须启用 enforce actions 严格模式才有意义。

**turbox** 中提供了 mutation 装饰器专门做数据处理和更新，一些业务流程和外部数据的获取，则可以被隔离开，这有助于更好的描述业务流程、复用复杂一些的更新计算逻辑等，使用形式如下：
```js
// turbox
class MyDomain extends Domain {
  @reactor() currentIdx = 0;
  @reactor() array = [];

  @mutation('xxx', true, false, true)
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

  @mutation('xxx', true, false)
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

  @mutation('xxx', true, false)
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
  immediately: false,
  displayName: '自定义名称',
  forceSaveHistory: false,
  isNeedRecord: true,
});
await f();
```

> 注意下 mutation 装饰器的参数，第一个参数 immediately 可以自定义 mutation 的名称，如未指定则默认使用函数名；第二个参数 displayName 代表这个 mutation 是否需要被当做一次独立的事务，默认是 false，所有的同步 mutation 会被合并成一个 history record 后再触发重新渲染，否则，每一次 mutation 执行完都会立刻触发一次重新渲染，并会被作为一次独立的操作记录到时间旅行器中；第三个参数 forceSaveHistory 用来强制把当前操作保存为一个历史记录，默认情况框架会根据一定策略来优化是否需要保存历史记录（如会影响 Reactive/reactive 依赖数据变化的操作，但是 immediatelyReactive 和 keepAliveComputed 的影响会被忽略直到下一次有影响的操作到来），极少数情况我们希望即使是纯数据无视图响应或 keepAlive 的部分也要存成一个历史记录，这时候就可以设置为 true；第四个参数 isNeedRecord 表示该次操作的变更是否需要记录到撤销恢复栈中，默认为 true，跟 reactor 装饰器的参数功能是一样的，只不过一个针对函数一个针对属性，但仍然受全局配置影响

> mutation 里面可以嵌套 mutation，但不可以嵌套 action

> mutation 是用来做变更的，符合规范的情况是它不应该有返回值，也没有必要有返回值，但如果有场景一定要返回值，也是可以接收到的

##### $update
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

上面提到的更新方式可能会让一些童鞋有疑问，为什么不在 mutation 或 $update 作用域内更新属性会报错，这就得先说一下背景。在框架层面，其实是不允许在 mutation 或 $update 以外的范围直接对数据做更改的，为什么要做这个限制呢？因为我们并不希望所有的数据更新零散在代码的各个角落，而是有个地方能明确收敛所有的数据更新操作，这样才会有利于组织我们的代码，也不会和非响应式的属性更新混在一起，也才能做一些撤销恢复事务的机制。

基于上面的前提条件，我们是不希望用户在 mutation 以外的范围做更新的，所以我们得提供一个报错机制来约束用户，没有这个机制的话数据和视图就不同步了。

所以在每一次 set 的时候，我们都会做一个检测，判断这个属性是否在指定合法范围内调用，当然这个其实只在开发时检测就够了，生产环境可以关闭以提高一丢丢性能：
```ts
private illegalAssignmentCheck(target: object, stringKey: string) {
  if (depCollector.isObserved(target, stringKey)) {
    const length = materialCallStack.length;
    const firstLevelMaterial = materialCallStack[length - 1] || EMaterialType.DEFAULT;
    invariant(
      firstLevelMaterial === EMaterialType.MUTATION ||
      firstLevelMaterial === EMaterialType.UPDATE ||
      firstLevelMaterial === EMaterialType.TIME_TRAVEL,
      'You cannot update value to observed \'@reactor property\' directly. Please use mutation or $update({}).'
    );
  }
}
```
但是光这样还不够，因为必然会存在一些 mutation 范围以外的赋值是不能去禁止的，比如初始化的时候，new 的时候，所以才为什么有上面代码里的那个判断 depCollector.isObserved 这个判断就是说当这个属性已经被代理过了，那么后面的更新必须经过检查，如果没有被视图同步过，那么可以在任何地方初始化。

#### action
`action` 通常是用来灵活控制操作行为/事务的 api，可以简单的理解为一种主动事务的机制，会影响撤销恢复的粒度。比如我们可以定义如下的一个 action：
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
    }, [], true, {});
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
// 一个异步的例子
const drawPoint = async () => {
  // do something
  await action.execute(async () => {
    // do something
    await drawDomain.drawPoint();
    // do something
  });
  // do something
};

/* 先画一个点，再画一根线，再画一个点，完成组合操作，假设不在一个执行栈中完成 */
drawPoint();
drawLine();
drawPoint();
```

当然在一些同一执行栈的场景，可能不需要这么灵活控制 action，框架也提供了语法糖，自动帮助你创建 action，execute 以及 complete：
```js
// 同步 action
const actionA = action('actionA', () => {
  domain.addPoint();
}, {
  displayName: '',
  isWrapMutation: true, // 是否自动包裹一个顶层 mutation，默认为 true
  mutationConfig: {
    immediately: boolean;
    displayName?: string;
    forceSaveHistory?: boolean;
    isNeedRecord?: boolean;
  }; // 自动包裹的 mutation 的配置
});
actionA();
// 异步 action
const actionB = action('actionB', async () => {
  await domain.addPoint();
});
await actionB(); // 异步情况下一定要 await 才能保证回调里的变更合并到一个事务里面，否则如果 await 后面还有变更，会被错误的合并到当前事务里面
```
也支持 @action 装饰器，但是不推荐使用，因为框架希望由 action 去组合 mutation 的逻辑，并不希望 action 再去嵌套 action，使用装饰器会让用户更容易做出这种误操作

> 注意：如果当前调用函数中只有一个事务的时候，使用被动事务机制即可，效果完全是一样的，使用这种方式的场景通常有两个：在一个渲染周期内需要人为分割出多次事务的场景、在一个事务中需要人为分割出多次渲染周期的场景，因为 immediately mutation 不仅会分离渲染周期也会分离事务，所以在外层包裹 action 可以保证被合并到一个事务中

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
action.abort(revert = true); // revert 参数默认为 true
// 丢弃当前未完成池中的所有事务
Action.abortAll();
```
abort 会把事务池中的当前事务移除，并且阻止未完成的事务继续执行 execute 和 complete，还会根据 revert 参数来决定是否需要回退掉已经发生更改的状态，并丢弃掉 diff 记录，不进撤销恢复栈。

也可以单独调用 undo api 来回滚这个 action 已经发生过的状态，这在一些长流程 action 的取消放弃操作场景会比较有用：
```js
action.undo(keepHistory = false); // keepHistory 参数默认为 false，做完操作后是否需要保留 diff 记录
```

对应也会有个 redo api 来恢复这个 action 已经发生过的状态
```js
action.redo(keepHistory = false);
```

turbox 的 action 机制指的是一个事务，一个步骤，而不是 web 场景中的一个 action 的概念。

在 turbox 中有主动事务和被动事务的概念

主动事务：
举个例子，在一些建模业务中，我需要画一个轮廓，我先画一个点，再画一根线，再画一个点，直到完成一个封闭图形才算完成了这个组合操作，而这些绘制行为其实都不是在一个同步执行栈中完成的，也就是说对于渲染来说，我确实是完成一个动作就得有一份对应的视图渲染出来，但对于撤销恢复来说，显然我撤销的不是最后一次画线的操作，而是撤销整个画轮廓的步骤，这就是我们要的主动事务机制，而决定事务什么时候开始，事务什么时候结束是强依赖业务逻辑的，所以我们得提供灵活的 API，让用户可以通过调用简单的 API 完成它想要的功能。

被动事务：
主动事务可以最大化的灵活控制事务的粒度，但是对于大多数场景，一个事件触发的一个行为基本上就是一个步骤，如果每一次我都要设置开始和结束，以及调用或者初始化一堆乱七八糟的中间类和函数，那会导致开发效率非常低下，尤其是我们这种 web ui 和 3d 场景兼有的业务场景。所以比较理想的方式就是默认是被动事务，加上主动事务辅助。被动事务其实就是上面提到的更新流程一节，只要记住一个数据的 snapshot 对应一个视图的渲染，就可以了，加上副作用、控制渲染时机的机制，已经足够满足需要。

当然我们业务中也会有更复杂一些的场景，比如做一个门板切割的行为，我可以连续切割，但是也有可能做了一系列操作之后放弃了，那需要退回某个节点的状态，如果要靠代码（逆向操作）去实现，是非常麻烦的，要知道模型的数据非常庞大且复杂，且一次操作不仅仅只是操作模型数据，即使是通过暴力 normalizr 也有局限性，比如性能问题、丢数据问题，只要靠“人和规范”解决的问题一定是不稳定的容易出错的，所以我们才需要通过框架提供的 Action API 来做 abort、revert 等功能，减少人工做这些事情出错的概率。

另外还有一些异步竞争的场景会比较复杂，但我说的竞态复杂还没有复杂到需要动用 rxjs 或者 saga 这样的库来解决，这样的库能解决一些问题，但是也会带来新的问题，如果使用者的水平和理解没有达到同一水平线，等于是搬起石头砸自己的脚，并且在这种既有业务里，rx 的理念更多的是希望作为一个插件用进来，而不是必选项。

所以我举的例子其实也比较简单，比如同时有三个异步事务在执行，这时候有这样一个需求，当满足某个条件的时候，我需要抛弃掉指定的前面几次事务，只保留最后一次，这就要求框架需要提供一个事务池，让使用者可以灵活控制这些事务。如下图：

![Image](https://pic4.zhimg.com/80/v2-cb6aee237e90a74cda9f3082e12f485a.png)

不仅要暂停前面两次事务往后执行，也要回退掉已经发生的变化，不然会导致状态错乱：

![Image](https://pic4.zhimg.com/80/v2-caa2fc7e874b7741f2033b0b62335e74.png)

等到全部完成清理掉事务池中的前面两次事务：

![Image](https://pic4.zhimg.com/80/v2-07f73c81a830a3fbc51552d870883698.png)

当然这只是比较简单的例子，实际场景中会有更多应用

<!-- #### effect（即将废弃重做）
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

后续 **turbox** 会把一些特殊的操作符挂载到 effect 修饰过的函数里，专门处理异步流程，如果所有操作都是同步的，那就没有 operator（操作符）什么事情了，但现实情况是某些场景异步任务非常多，虽然说大多数场景 async 函数和默认的基础中间件就已经足够了，但在一些异步任务竞争的场景还是不够用的，比如在异步任务还没完成的时候，下几次触发又开始了，并且这几个异步任务之间还有关联逻辑，如何控制调度这些异步任务，就需要通过各种 operator 来处理了。 -->

#### Domain
在上面的例子中，我们会发现有个 Domain 的基类，在 **turbox** 中，Domain 用来声明这是一个领域模型，提供了一些通用方法和控制子类的能力，该类的装饰器实际也会依赖基类上的一些私有方法，所以需要配套使用，如下代码所示：
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
const a = action('customNameAction', async () => {});
a();
const computedValue = computed(() => objectValue.xxx + arrayValue[0]);
```

或者你也可以使用语法糖将他们聚合到一起，但不推荐直接在业务代码中使用，原因是既没有简洁的写法可以做到每个属性/函数支持自定义配置，而且还会导致类型推导失效（无法做到推出所有类型细节，并且没有简洁的语法可能性，框架在现有设计下权衡后放弃实现）所以函数式是阉割版的 domain 写法：
```js
const domain = createDomain({
  reactor: {
    first: 'xxx',
    last: 'vvv',
  },
  mutation: {
    changeFirst() {
      this.first = 'ddd';
    }
  },
  computed: {
    cp() {
      return this.first + '***' + this.last;
    }
  },
  action: {
    ac() {
      console.log('A*C');
      this.changeFirst();
    }
  }
});

reactive(() => {
  console.log(domain.first, domain.last);
  console.log(domain.cp.get());
});

domain.changeFirst();
```

#### Reactive/ReactiveReact
**turbox** 中的 @Reactive/@ReactiveReact 装饰器，有点类似于 **mobx** 的 @observer，它的作用就是标记这个 react 组件需要自动同步状态的变更。它实际上是包裹了原始组件，返回了一个新的组件，将大部分响应式同步状态的链接细节给隐藏起来。要使用 domain 中的状态和函数，只需要将 domain 实例化，并直接访问实例上的属性和函数，如下所示：
```js
import $column from '@domain/dwork/design-column/column';
import $tag from '@domain/dwork/design-column/tag';
import $list from '@presenter/dwork/column-list/list';

@ReactiveReact()
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

> 你也可以将 ReactiveReact 使用在搭配 react hooks 的函数式组件上，使用方式见快速入门一节

> 任何访问到 domain 状态的组件都必须用 ReactiveReact 修饰，否则不会同步到这个组件

> 如果你只想在父级组件加 ReactiveReact 装饰器，又想同步子组件状态，你就只能通过触发父级组件依赖到的状态的变更来重新渲染引起子组件的重新渲染

在一些有列表的地方，建议父子组件都加上 ReactiveReact 装饰器，这样当只更新列表中某一或某几项时，只会触发对应子组件的重新渲染，不会触发所有组件的重新渲染，这样性能更佳，如下所示：
```js
import $list from '@domain/list';

@ReactiveReact()
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

@ReactiveReact()
export default class Item extends React.Component {
  render() {
    const { data } = this.props;
    return (
      <div>{data.txt}</div>
    );
  }
}
```

> ReactiveReact 是针对 React 组件的响应式装饰器实现，而 Reactive 是针对图形渲染框架（renderer-core）组件的响应式装饰器实现，你也可以基于 turbox reactivity 的基础 API 来实现其他自定义装饰器

#### reactive
```typescript
interface Options {
  name: string;
  /** is computed reactive function */
  computed: boolean;
  /** is lazy computed, only computed reactive have this option */
  lazy: boolean;
  /** deps */
  deps: Function[];
  /** trigger callback synchronously */
  immediately: boolean;
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

> 注意：reactive 内的函数第一次会自执行，这样才能收集到依赖，也符合状态机第一次初始化的思想

但有些时候，我们不想用来当作状态机自执行，而是想做类似 watch 属性变化的能力，那么可以传入 deps 参数，它是一个函数数组，返回值是你需要监听的依赖，只有当这些依赖中的任一依赖发生变化时，你的 reactive 才会被触发，并且 reactive 的函数参数列表对应的就是 deps 的函数返回值列表，顺序是一致的：
```js
reactive((nickName, a) => {
  console.log(nickName, a);
}, {
  // name: 'xxx',
  deps: [
    () => domain.nickName,
    () => domain.info.a,
  ],
});
```

> 注意：如果传入 deps 监听依赖，那么 reactive 的函数第一次是不会自执行的

有些时候，我们想要 reactive 的触发时机是同步的或是异步的，只需要设置 immediately 参数即可，默认为 true，即 mutation 完成就立刻同步触发，设置为 false，则使用 mutation 的异步触发机制
```js
reactive((nickName, a) => {
  console.log(nickName, a);
}, {
  // name: 'xxx',
  deps: [
    () => domain.nickName,
    () => domain.info.a,
  ],
  immediately: true,
});
```

#### computed
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

> 计算属性有一个 lazy 的配置参数，该参数决定计算值是否需要实时进行 dirty 检察，默认关闭。如果打开意味着只会在即将触发 reactive 或 Reactive 时才会做一次 dirty 检察，在这之前获取计算值一直是旧的。如果关闭，那么在每次原子操作 (mutation、$update) 之后都会检察计算值是否 dirty，这样会多消耗一些性能，但是可以保证每次更新完得到的计算结果都是最新的，两种方式都有使用场景

计算属性其实就是一种特殊的 reactive，有依赖变化需要重新计算，没有则直接用上一次的值，区别就在于它有返回值，需要缓存计算值，需要做惰性求值，脏值标记和 keepAlive 的功能：
```ts
if (typeof args[0] === 'function') {
  let value: T;
  let dirty = true;
  let needReComputed = false;
  let needTrigger = false;
  let computedRef: ComputedRef<T>;
  const computeRunner = args[0];
  const options = args[1];
  const lazy = options && options.lazy !== void 0 ? options.lazy : true;

  const reaction = reactive(() => {
    dirty = true;
    if (needReComputed) {
      value = computeRunner();
    }
    if (needTrigger) {
      triggerCollector.trigger(computedRef, ESpecialReservedKey.COMPUTED, {
        type: ECollectType.SET,
        beforeUpdate: void 0,
        didUpdate: void 0,
      });
    }
  }, {
    name: 'computed',
    computed: true,
    lazy,
  });

  computedRef = {
    get: () => {
      if (dirty) {
        needReComputed = true;
        needTrigger = false;
        reaction.runner();
        dirty = false;
        needReComputed = false;
        needTrigger = true;
      }
      depCollector.collect(computedRef, ESpecialReservedKey.COMPUTED);
      return value;
    },
    dispose: () => {
      reaction.dispose();
    },
  };

  return computedRef;
}
```
看代码可以知道第一次会执行计算函数，收集依赖，后面如果有依赖变化，reactive 中的回调会被再次执行，这时候该计算属性就被标记为 dirty 了，但是并不会立即求值，等到下一次被 get 的时候，发现是脏值才会重新计算，如果不是脏值，就直接返回之前计算过的 value。

当然计算属性本身也是需要被收集的，这样当视图依赖了计算属性，而没有直接依赖更底层的属性时，也能因为底层依赖的变化触发该视图的重新渲染。


#### init
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

> 为什么要放到 init 函数里面做初始化状态操作？原因是需要在 render 之前清理一些由 new、或异步接口产生的不可控的第一次的数据更改记录，只有收到 init 函数里才能集中控制，并在初始化完成后还会清理当前撤销恢复栈，因为初始状态并不应该被记录到撤销恢复栈中，只有后续操作才应该被记录，这是一种默认行为。而因为在初始化过程中也有可能产生状态记录，所以 init 函数默认会做清理。

#### middleware
中间件机制，我们想要的其实就是类似 koa 的洋葱模型，实现原理就不用多说了，通过 reduce 和 middleware chain 来做，turbox reactivity 的中间件机制是支持异步的，当然传入的参数也会不太一样，提供了获取行为链、依赖图、dispatch 等能力，同时也内置了一些基本的中间件，部分可通过配置开关。接口如下：
```typescript
type Param = {
  dispatch: (action: DispatchedAction) => any | Promise<any>;
  getActionChain: () => ActionType[]; // 获取行为链路
  getDependencyGraph: () => Map<object, DepNodeAssembly>; // 获取依赖图
}
type middleware = (param: Param) => (next) => (action: DispatchedAction) => (action: DispatchedAction) => any | Promise<any>;
type use = (middleware: middleware | middleware[]) => void
```
**turbox** 内置了 logger 中间件，logger 默认关闭，在生产环境根据环境变量关闭，是用来打日志的，可以看到变化前后的 reactor state 值，你还可以提供自定义的中间件来触达 action 的执行过程，中间件的写法保留了 **redux** 中间件的写法（参数不太一样），你可以像下面这样使用 use 方法添加中间件：
```js
const middleware = ({ dispatch, getActionChain, getDependencyGraph }) => (next) => (action) => {
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

#### config
```typescript
type Config = {
  middleware: {
    logger?: boolean,
    diffLogger?: boolean,
    effect?: boolean,
    perf?: boolean,
    skipNestLog?: boolean,
    skipNestPerfLog?: boolean,
  },
  timeTravel: {
    isActive?: boolean,
    maxStepNumber?: number,
    keepActionChain?: boolean,
  },
  disableReactive?: boolean,
  strictMode?: boolean,
  devTool?: boolean,
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
    logger: process.env.NODE_ENV !== 'production', // 默认在 dev 环境开启 logger 中间件，在生产环境关闭
    diffLogger: true, // 默认开启 log 状态的 diff 信息
    effect: false, // 默认关闭 effect 中间件
    perf: process.env.NODE_ENV !== 'production', // 默认在 dev 环境开启 perf 中间件，性能分析用，在生产环境关闭
    skipNestLog: true, // 默认开启跳过被嵌套的 mutation 执行的日志
    skipNestPerfLog: true, // 默认开启跳过被嵌套的 mutation 执行的性能日志
  },
  timeTravel: {
    isActive: false, // 是否激活时间旅行器，该配置的优先级为最高，关闭时所有可产生历史记录的操作都不会被记录
    maxStepNumber: 20, // 记录操作的最大步数
    isNeedRecord: false, // 所有属性状态是否需要被记录的全局配置，默认全不记录（注意：只针对属性）
    keepActionChain: process.env.NODE_ENV !== 'production', // 默认开启保存 actionChain 到撤销恢复栈中，在生产环境关闭
  },
  disableReactive: false, // 是否禁用响应式
  strictMode: process.env.NODE_ENV !== 'production', // 严格模式，开启非法赋值检测，默认在 dev 环境开启，生产环境关闭
  devTool: false // 默认关闭 devTool，在生产环境自动关闭
}
```

> 必须在 Turbox.render 之前调用

#### exception
**turbox** 默认在 ReactiveReact 函数返回的 react 高阶组件中加了 ErrorBoundary 组件来 catch 组件异常，防止整个应用全部崩溃。

#### 响应式原理
上面说了很多响应式的 API 和设计思路，这一小节主要是介绍原理，响应式的核心原理就是依赖收集与如何触发：
* 利用 defineProperty 和 Proxy 来做代理，劫持访问符和赋值，收集依赖、触发依赖
* 利用栈来存储 reaction id，结束时出栈，跟执行栈保持一致，react 下可以改写 render，触发时调用 forceUpdate，普通回调就是重新执行该回调

建立组件树实例 id 和对应依赖的关系，跟执行栈保持一致：

![Image](https://pic4.zhimg.com/80/v2-3fdc61967e0ada486deed870c3b05d54.png)

依赖树的数据结构：

![Image](https://pic4.zhimg.com/80/v2-72b85933305c1987c5d7b1b66f77718d.png)

触发依赖只需要去依赖树中找到对应的 reactionId，即可触发对应的重新渲染或回调

有依赖收集必然有依赖淘汰机制，当属性不再被依赖到这个 reactive 视图或函数后，就应该移除依赖，不然会触发不该触发的重绘，为了不阻塞渲染，我们通过反向建立一颗状态树来存储依赖的状态，这样我们就可以把依赖淘汰移动到渲染完成后再去做，而不是每次暴力清除再重建：

第一次我们都标记为 latest：

![Image](https://pic4.zhimg.com/80/v2-56180b3e4825497f97bb6c989ba023c6.png)

收集后我们把依赖都标记为 observed：

![Image](https://pic4.zhimg.com/80/v2-59e0adf7d9ce1b25f4eb589aedd3e6f2.png)

再次更新后，把这次依赖到的属性标记为 latest：

![Image](https://pic4.zhimg.com/80/v2-70b7df24d78d952554ac5e8e9780b6d1.png)

那么在这次收集完成后，我们只要把 latest 置为 observed，把 observed 的置为 not observed 的，然后把 not observed 的依赖清除掉即可：

![Image](https://pic4.zhimg.com/80/v2-968ae78cc27e91ad594d9bd151e67c03.png)

#### 数据更新原理
虽然是响应式数据流，但是并不希望那么灵活，在实际的业务开发中，我们依然还是需要类似 action 或者说指令的概念，之前也有提到为什么需要包在 mutation 里做更新，因为底层我仍然需要有撤销恢复、渲染时机的控制、中间件等机制，所以不管你怎么响应式，我底层就是个 store.dispatch 只不过那肯定是要比 redux 复杂的多，才能实现这些能力，流程图如下：

![Image](https://pic4.zhimg.com/80/v2-541564db26c835c43c16c323e78d8dc8.png)

这里简单提一下副作用这个概念，这个概念应该是 redux 提出来的，有这个概念的原因是一次数据的 snapshot 对应一个视图状态，当一次 action 操作产生了两次或多次对应的视图状态，则被认为是副作用，通常发生在异步场景。而在 turbox reactivity 中，所谓的副作用其实用个 async 函数就能体现，await 之前比如是一次数据更新，await 之后是另一次，甚至都不应该叫做副作用。

但有时候我们也需要忽略副作用，比如我们有一些改柜子参数的场景，改参数会触发拉取公式，然后通过公式进行耗时的复杂计算，最后才算完成，这个过程是个异步的，但是这个过程本身计算的中间结果我们并不希望立刻反馈到视图或回调逻辑上，这就需要忽略这个副作用，等到这个完整操作执行完才反馈到视图，作为一个独立的步骤。这种情况可以使用异步的 mutation 来支持。

#### time travelling
框架提供了时间旅行功能，可以做撤销恢复，以及获取是否可以撤销恢复的状态、撤销恢复状态变更的钩子函数，动态暂停或继续运行时间旅行记录器、清空撤销恢复栈、切换撤销恢复栈等。对应的接口：
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
  onChange: (undoable: boolean, redoable: boolean, type: HistoryOperationType, action?: Action) => void;
}
```

你可以创建多个时间旅行器，并切换应用它，这时相应的操作会自动记录到当前最新被切换的时间旅行器实例中，如果要退出当前的，只要切换到其他旅行器即可
```js
const mainTimeTravel = TimeTravel.create();
TimeTravel.switch(mainTimeTravel);
```

> 时间旅行只会记录每一次变化的信息，而不是整个 snapshot，这样内存占用会更小

> 时间旅行也会记录调用路径的函数名或自定义函数名

撤销恢复依赖于前面我们提到的属性修改的代理，每一次修改我们都会记录状态修改的类型和修改之前的值、修改之后的值，将修改记录暂存，当然在一个步骤内的修改是会被合并的。

框架提供的撤销恢复操作其实是一种特殊的 mutation（不记录 actionChain 和 history），根据修改类型执行不同的赋值或还原操作：
```typescript
static undoHandler(history: History) {
  history.forEach((keyToDiffObj, target) => {
    if (!keyToDiffObj) {
      return;
    }
    keyToDiffObj.forEach((value, key) => {
      if (!value) {
        return;
      }
      if (value.type === ECollectType.MAP_SET || value.type === ECollectType.MAP_DELETE) {
        if (value.beforeUpdate === void 0) {
          (target as MapType).delete(key);
        } else {
          (target as MapType).set(key, value.beforeUpdate);
        }
      } else if (value.type === ECollectType.SET_ADD) {
        (target as SetType).delete(key);
      } else if (value.type === ECollectType.SET_DELETE) {
        (target as SetType).add(key);
      } else {
        if (Array.isArray(target) && value.beforeUpdate === void 0) {
          delete target[key];
        } else {
          target[key] = value.beforeUpdate;
        }
      }
    });
  });
}
```
要注意的是，撤销恢复一定是有最大步数限制的，毕竟内存是有上限的，即便是只存了 diff 而不是全量的值，所以当达到了步数上限后，将最后的记录加入队列，将最早的操作记录就得相应移出、清除，所以撤销恢复严格来说并不是一个栈，而是一个队列，需要满足先进先出。

有时候我们会做撤销恢复操作，回退到中间某一步，然后这时候开始做新的操作，这种情况就得考虑到覆盖当前指针以后的记录了，替换为当前操作。

看到这里，一定有童鞋有疑问：
* 你这种做法，如果数据记录的是引用类型怎么办？直接赋值引用类型难道没有问题吗？
* 传统软件行业一般都会设计一个文档系统，负责撤销恢复、加载保存文档，你这个和传统的方式有什么区别和优势？

惯性思维让我们认为要做撤销恢复，必须得 normalizr、serialize 转成扁平化的 plain object 数据才可以做。这个思路本身是对的，这是做一个稳定的撤销恢复机制的方案，虽然看上去挺粗暴的，但至少可以保证解决引用值被修改的问题，也肯定比基于手写逆向操作的机制要先进、准确，更可以方便的做磁盘交换来缓解内存压力（依赖实现 serialize、deserialize）。缺点就是如果要拷贝的整个引用类型数据量很大，一方面会牺牲很多数据转来转去过程中的时间性能，另一方面也会占用很多额外内存空间（在 3d 定制业务中除了本身的模型数据，还有约束求解器的大量生产参数数据，这种做法在这种业务场景中是完全不可用的，随便做一二个复杂步骤，就有内存直接崩溃的案例），因为不基于响应式状态管理这套方案，传统的方案你是无法知道哪些属性哪些 model 发生了变更的，为了稳定性你只能全量去存快照，当然你说可以只把有改动的 model 快照存进去，这样就产生了新的问题，你得维护一个 updatedModels 的列表，每个操作完成时，你都得手动去维护告知文档系统要存哪些 model 快照，有很大的心智负担，即使是这样，也只解决了一小部分问题，属性级别的 diff 是不可能通过人工心智去维护的，当然你仍然可以说我不需要属性级别的 diff，model 级别的快照就足够了，毕竟我还可以利用磁盘交换来解决内存占用高的问题，但是利用磁盘的问题是存取时间会被拉长，尤其是大数据量还原的时候，撤销恢复并不像用户预期的那样快，更像是个异步操作的速度，体验就大打折扣了。另外，视图层对 model 的响应在传统做法中也是需要人工维护的，也就是说虽然业务层 model 已经撤销恢复做了变更，但是如何通知视图层做出响应是个问题，传统的方式一般是手工通知或者包在基础层代码里，比如刷新面板或者同步场景世界对应的 view model，让视图层重新根据业务 model 来计算和渲染，但维护视图和数据的同步逻辑或依赖关系就会强耦合业务，或人工声明。

总体来说，传统方案的基础上做一些基础层的框架性代码，并让开发者去遵守开发规范，是可以达到满足绝大部分应用场景的，但是它并不足够易用和高性能，开发者需要调用和关注的点仍然不少，维护的成本不低，以往在客户端上的重型软件如今搬到 web 端来做，其实性能上的挑战会更高，会比在客户端上更吃紧，而我所遇到的场景就相当于在 web 上做一个 PS、做一个 AutoCAD、SolidWorks。

我理想中的方案是开发者只要遵守数据驱动视图的原则，关注哪些变更操作需要作为一个步骤，就完事了，除此以外的其他事情，全部交由框架来完成，不需要调用任何一行额外的代码，让使用者是 0 心智负担和业务无关的，也就是说做完功能后，撤销恢复就自动实现了，不需要额外花精力去调试开发，也不需要去理解什么文档系统，一切都是状态（数据），不要把 3d 世界里的那些 entity、document 的概念强行附加到撤销恢复的方案上去，毕竟有些 web 页面也有回退操作相关的场景。用户只需要定义哪些数据需要撤销恢复，配置最大步骤，关注哪些行为是一个步骤即可。有了这个前提加上响应式的理念，自然就有了基于数据 diff 来做撤销恢复的思路，其实基于数据 diff 来做撤销恢复，是一种变形版的“逆操作”做法，只不过不是傻傻的让用户自己去写逻辑，而是基于记录属性的变化，来做逆操作。

原理听上去还是很简单的，但不通过序列化，这种方式是怎么记录引用类型的变化的。实际上我们操作具体状态的变更的时候，大部分情况都是在赋值基本数据类型，因为只有这些数据，才能真实的在需要渲染的场景被读取出来或拿来用，比如一个嵌套对象 ```{ a: { b: { c: 1 } } }``` 我们肯定不会直接去用 a.b 因为它是一个对象，但是我们一定会去读 a.b.c 比如在界面显示一个数量，这是一个具体的值，即使你真的需要使用一个引用类型的属性的时候，也一定是类似这样的场景：

```parent = new Cabinet()``` 然后这时候更新了 parent，```parent = new Door()```，撤销恢复的时候，退到了 parent 为 cabinet 实例引用的情况，如果这时候有别的地方把 cabinet 实例的值修改了，下一次再退回来的时候，有的童鞋会担心两次结果不一样，不符合预期。其实完全不用担心这种情况，因为修改 cabinet 实例上的属性这个操作本身也会被记录下来，所以只要叠加上去，引用的值也会被正确的撤销恢复，只要这个属性是被 reactor 装饰器修饰为响应式的。

说的明白点，就是 reactor 默认会对每一层的嵌套对象都做代理（前面提过），直到代理到根节点（有基本数据类型的值），如果值是引用，会继续往下代理，这样，其实所有的属性变化框架都一清二楚，哪怕你是引用类型，也可以正确的通过叠加每一个细粒度的变更来还原现场。只有一种情况会出现差异，就是这个引用值不在框架的控制范围，是一个自己外部创建的引用类型，并且不是响应式的，比如把 reactor 的第一个参数 deepProxy 设置成了 false，那么框架肯定代理不到引用内部的结构了，比如某个模型渲染所需要的 metadata 或者顶点材质数据，这时候你去改这个对象，是不会被记录的，两次撤销的结果自然也会不一样，但这种问题实际上根本不存在，因为既然你都取消了深度代理，还想改属性引发变更，一定是要通过 immer.js 或者 immutable.js 来做拷贝赋值的，把引用改掉，不然的话当然不起作用了。

但这种做法也是有缺点的，基于内存中引用属性 diff 的撤销恢复，始终是在当前一个已知应用程序状态下进行前进后退的，也就是说不能跳步（比如不能从第 5 步直接跳到第 3 步，要依次做 5、4 的逆向操作），毕竟存的只是 diff 数据，要根据内存数据来 patch 这些 diff 的。另外，即使是基于 diff，依然还是会有内存占满的可能，diff 只对修改部分状态起到较大的优化效果，如果是类似一些替换、重算轮廓等几乎更新了所有数据的场景，并没有什么空间上的优势，真实场景中的撤销恢复还是要结合前后端、磁盘交换一起来做，以达到释放端上内存压力的效果。

但总的来说，这种做法在性能、易用性上是完胜传统做法的，它的代价主要就是集中在依赖收集阶段，这也是所有响应式框架的特点，但带来易用、可维护和更新效率、撤销恢复效率上的提升是非常大的，好处可以说是非常多。

当然撤销恢复也得支持暂停、重启，多个撤销恢复队列，切换队列，清空等功能，这都是我们业务需要的场景。

最后附上一张简单的图：

![Image](https://pic4.zhimg.com/80/v2-cdc19140bdcc1cd3190743ee22aec6e3.png)

### 最佳实践
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

### 框架特性对比
以下简单介绍几个业界比较流行的框架和 **turbox** 框架，让不了解状态管理的童鞋可以快速找到自己适合的框架。

#### react-redux
**react-redux** 是比较经典的状态管理框架，最优秀的地方在于可扩展性和可预测性，个人使用感受来说适合一些复杂稳定的业务，并且还是比较考验架构设计的，**redux**（以下代指 **react-redux**） 相对来说还是给了开发者比较多折腾的空间，核心代码不多，扩展能力强，但直接裸用 **redux** 开发链路较长，心智负担较多，效率不算很高。

[如何评价数据流管理框架 redux？](https://www.zhihu.com/question/38591713)

#### react-redux 架构图
![redux](https://qhstaticssl.kujiale.com/as/ddae6a4d54ba1e65b5833508fd59ff5c/redux.png)

#### dva
**dva** 是基于 **redux** 的状态管理框架，但它不仅仅是个状态管理框架，还捆绑了 cli、router、saga 等能力，配合 **umi** 这套整体解决方案，看起来对于快速搭建应用还不错，它的能力非常强大，集合了多个框架再封装，几乎不怎么再需要添加其他三方库了，不过因为直接依赖了一些三方库，更新维护成本和难度还是挺高的，在社区上不算是很活跃，概念也非常多，适合一些对 redux 系列库比较熟悉的开发者。

[如何评价前端应用框架 dva？](https://www.zhihu.com/question/51831855?from=profile_question_card)

#### dva架构图
![dva](https://qhstaticssl.kujiale.com/as/99322f8bdbfcaa47da9ce3cdd5854075/dva.png)

#### mobx
响应式数据流的代表 **mobx** 和 **vue** 的写法有相似之处。很多人说，**mobx-react** 是给 **vue** 的狂热粉丝用来写 **react** 的，这个说法很有趣，但在实际普通 web 业务开发中，不可否认它们的写法确实更无脑也更方便，很惊艳也很容易上手，概念也比较少，还是挺适合大部分 web 项目的。不过会比较难测试、难调试，流程复杂的项目自描述能力也比较差，更容易写出过程式代码，扩展和生态都不算是很好，但 mobx 的作者更新还是比较频繁，现在能力也越来越强大了。

[如何评价数据流管理框架 mobx？](https://www.zhihu.com/question/52219898)

#### mobx-react架构图
![mobx](https://qhstaticssl.kujiale.com/as/654ae258534c4b8c8f5b21f8f1282e52/mobx.png)

#### vuex
**vuex** 是 **vue** 的状态管理框架，整个流程上的理念基本和 **redux** 没有太大区别，主要的区别是在 **vue** 中可以直接更新 state，不需要拷贝，因为这个过程并没有像 reducer 纯函数那样具有明确的输入输出，所以 **vuex** 给它起了个名字，叫做 mutation，因为概念上任何一次相同的输入都得到相同的输出才更符合 reducer 纯函数的特性，所以“突变”更加适合 **vuex** 中的更新行为。

#### vuex架构图
![vuex](https://qhstaticssl.kujiale.com/as/e738c068c874a74d0192c83b039980e9/vuex.png)

#### turbox
**turbox** 是一个包含了状态管理的大型 3d/web 应用开发框架，它的灵感主要还是来源于社区和部分复杂业务场景，**turbox** 设计的初衷是想用友好易懂的使用方式满足复杂业务场景，吸收图形与 web 领域的优秀思想，解决复杂通用问题，并提供一些周边工具来进一步提效，尽可能把一些不易改变的决定抽离出来，规范统一大家的代码认知，这就是 **turbox** 框架的意义所在。

- 面向 web/3d 应用友好，拥有较多大型复杂 web 2d/3d 多人项目的线上实践案例与针对性优化
- 基于 Proxy 的响应式状态管理
- 支持复杂图状数据结构，而不仅仅是 plain object
- 更好的分层，将数据更新与业务流程隔离
- 中间件系统，让更新流程得以扩展不再黑盒，可以做诸如流程全埋点，线上链路故障排查，性能分析，自动化测试等
- 事务机制，让你更好的合并与记录操作行为
- 内存占用更小更灵活的时间旅行机制，轻松实现撤销恢复、指令流链路跟踪重放等功能
- 丰富的配置，在不同场景下轻松平衡易用与性能
- 默认提供处理副作用的装饰器，对异步场景更友好
- 提供了计算属性和属性钩子，来处理复杂计算与特殊场景
- 更加简易的初始化 API，只暴露修改配置的能力
- 完美支持并推荐使用 typescript，没有任何魔法字符串，完备的类型推导，充分利用编辑器的 navigation 与反向依赖分析使开发和维护效率更上一层楼
- 支持 react hooks
- 基础库 0 依赖，外部框架无关，是个纯粹、精简的解决方案，有较好的抽象分层，可基于基础库扩展不同的自定义实现，升级维护都比较容易，不容易腐烂
- 友好的文档和最佳实践，对于没有用过状态管理框架的新手来说，还算比较容易上手

#### 为什么不是 redux？
这个应该比较好理解，业界也比较公认它的一些缺点

* 模板代码太多，使用不方便，属性要一个一个 pick，对 ts 也不友好，状态的修改重度依赖 immutable，计算属性要依赖 reselect，还有魔法字符串等一系列问题，心智负担大，用起来很麻烦容易出错，开发效率低下
* 触发更新的效率也比较差，connect 的组件的 listener 必须一个一个遍历，再靠浅比较去拦截不必要的更新，在大型应用里面无疑是灾难
* store 的推荐数据结构是 json object，这对于我们的业务来说也不太合适，我们的数据结构是图状的数据结构，互相有复杂的关联关系，比如父子兄弟层级、环状结构、链式结构、多对多等，比较偏向于后端数据模型，适合用面向对象来描述模型，描述切面，需要多实例隔离，显然用 json 或者 normalizr 强行做只会增加复杂度，和已有的代码也完全无法小成本适配
* 无法适应复杂 web 2d/3d 应用场景

#### 为什么不是 mobx？
* 以前开发该库的时候 mobx 还是基于 defineProperty 来实现的，有很多 hack 的方式，比如监听数组变化等问题的处理，还有很多像监听 Object.keys 这种 API 根本就无法实现，而 tacky 一开始就是基于 proxy 的，我们的业务只要求兼容 chrome，所以就可以用，这样写法会简单很多不需要 hack，支持监听的 API 也会更丰富，当然目前 mobx5 也支持了 proxy。（注意：proxy 在特定浏览器比如 chrome 的性能表现非常优秀，但在 IE Edge 下面性能非常差）
* 然后就是我们需要做一些撤销恢复，mobx 目前只能依赖于 mobx-state-tree 来做，但有非常大的语法成本，需要改数据结构和定义 schema，有点退化成 redux 的感觉。而自己实现的目标主要是为了满足特定业务场景，并在这基础上做针对性优化，而不是做什么通用方案。turbox 的做法是只保存每次修改过的属性的 diff 信息，而不是全量保存，不然内存很容易崩掉。在进入 mutation 前和执行完后，会对修改过的属性记录 beforeUpdate 和 didUpdate 的值，重复修改会被合并掉。不需要人工去写 undo redo，并且提供了丰富的相关能力，以后还会加入更多优化。
* 另外我们需要有一些事务的机制，跟传统 web 一个同步栈或者一个 effect 就是一个事务的视角是不一样的。比如我要画点，画线，再画点，这三个行为才组成了一个事务，要回退是撤销一整个事务，而不是单个行为。另外我们在一些异步并发的场景，需要对事务池做一些调度，比如 abort、revert 掉部分事务。事务的定义就是：一个需要被记录到时间旅行器中的原子操作，我们一次操作可能会产生很多副作用，也可能分发多个 mutation，默认同步的 mutation 会被合并掉，一次性 batchUpdate 组件，用户可以自己定义事务，每个事务会影响撤销恢复的粒度和重新渲染的时机。
* mutation/action 对于渲染时机的把握功能会更丰富，也更灵活，更符合当前业务场景，而 mobx 目前无法满足，仍然是以 web 世界的角度在做 action 机制，无法灵活控制渲染时机
* 另外就是扩展性的问题，我加入了中间件的机制，这样可以侵入 action 的执行过程，相当于一个过滤器一样，可以加入一些内部自定义的埋点、监控、日志中间件，在每次 action 触发的时候可以做很多事情，比如对接全链路排查系统、做自动化测试状态回放等。
* 实际上在 3d 业务里面，传统的 effect 概念是个伪命题，它的发展方向应该是异步流，这样对于一些异步竞争比较复杂的场景会比较有用，并且可以简化部分事务的写法。
* 还有就是做了不能在不是 mutation 的地方做更新的机制，强制分离更新数据操作和业务流程，做了一个分层，如果这么做会有抛错，防止数据和视图不同步。当然做这个的意义本质一个是性能考虑批量更新，一个是也会影响事务，再者是职责分离，还有在收口赋值操作，这对重构非常有帮助。
* 最后就是也完美支持 ts 和 react hooks。保证所有的依赖声明都是可以推导和反向依赖分析的。并且没有任何三方依赖，不依赖外部库意味着体积小、性能可控、非常容易维护和升级，腐烂的速度会比较慢一些。包体积很小，gzip 后只有 6.9 k，这还没有让库直接依赖混淆的版本，比如 react，不然应该在 3-5 k左右，是 mobx 体积的一半。
* 无法适应复杂 web 2d/3d 应用场景

### 性能分析
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

#### 测试结果
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

#### 结论分析
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

对的，你没看错，即使在外部包裹了 action，也只会对当前宏任务（macro task）做合并，但对 await 后面的执行却无法合并，这跟 mobx 同步渲染的机制其实有关系，实际上只能通过其他办法比如 runInAction 来做合并，直接这么写是实现不了的。但是 turbox 可以。

turbox 的机制其实更符合原生体验，灵感来源于 react 和 vue
* 调用一个 mutation 渲染一次，mutation 可以嵌套，以最外层的调用结束为准重渲染一次，同步的 mutation 就跟同步的函数一样，即使不用包裹也会被自动合并。
* 如果需要调用完 mutation 立即重绘也可以支持
* 异步的调用可以直接用普通的 async 函数去调用 mutation，也可以做到 web 场景类似”side effect“概念的天然支持，但开发者却可以不用去理解副作用是什么概念
* 如果有些场景想等整个异步函数结束才去渲染一次，可以使用异步的 mutation，这样就会阻止掉出现”side effect“的情况

综上来看，turbox 的机制在性能和功能覆盖度的权衡上会更贴合现有业务场景，实际上 web 场景根本遇不到这么复杂的情况，mobx 也完全可以胜任（不考虑中间件和时间旅行），但在 3d 场景，哪怕是结合 web 技术的时候，差异还是很大的

## 指令管理框架
简单来说，这是一个处理图形 entity 交互逻辑的管理器，不同于 web，图形业务中的交互事件通常会比较复杂，由多个事件组合完成，并且也会处理比较多的临时计算、事务等逻辑，有些临时计算还需要反馈到界面上，该框架主要目的是解决如何更好的内聚、扩展、启用卸载交互模块，以达到复用、组合出不同的交互指令，让业务开发更高效、可维护性更高，不耦合视图层和 model 层。

指令管理主要就两个概念 BaseCommand 以及 BaseCommandBox。前者是指令组件的基本单元，要声明一个指令只需要继承 BaseCommand 即可，指令可以通过 compose 方法组合出一个新的指令，组合过的指令还可以继续自由组合，指令组件可以理解成一个物料，此时它还没生效。而后者就是用来装载指令使其生效的，通常一个场景对应一个 BaseCommandBox，Box 中可以添加不同的指令，但要特别注意的是，同一时间只有一个指令会被激活，也就是说假如有 ABC 三个指令，你激活了 A，那么 BC 自动会被卸载，激活了 B，AC 自动会被卸载，他们之间是互斥的。

这么设计的原因主要是以下场景：比如在刚进入一个场景时，就默认激活一个 default 指令（可能组合了不同的子指令，比如提供了选择、hint 等默认能力），此时点击绘制轮廓按钮，我的需求是立即让原来的场景事件失效，进入到绘制指令下，不然事件显然会容易混乱冲突，有了 Box 的能力后，就可以轻松交给框架管理，用户只需要关心我当前需要激活什么指令环境。

上面这个案例是图形业务里面必然要解决的。除此之外，指令也提供了重写 active 和 dispose 方法的接口，与之对应的，用户也可以通过指令的实例来调用对应的 active 和 dispose 方法来主动执行激活或卸载方法。

> 指令可以通过链式访问的方式来访问指令的子指令、孙子指令上面暴露的方法。

> active、dispose 方法可以传参，从而实现配置化使用指令组件的效果

> 指令对应的事件回调可以参考 ts 提示的接口，这里不再罗列

> 通常指令跟响应式框架中的 action 一起配合使用，来方便的做到一个可撤销恢复的步骤

下面是使用案例：
```ts
class ACommand extends BaseCommand {
  action?: Action;

  active(param: IActiveParam) {
    this.action = Action.create('doSomething');
  }

  onCarriageEnd(ev: IViewEntity, event: SceneEvent) {
  }

  onDragEnd(ev: IViewEntity, event: SceneEvent) {
    this.action.complete();
  }

  onRightClick() {
  }

  onCarriageMove(ev: IViewEntity, event: SceneEvent) {
  }

  onDragMove(ev: IViewEntity, event: SceneEvent) {
    await this.action.execute(async () => {
      // do something...
      await this.domain.addProduct();
    });
  }
}

class BCommand extends BaseCommand {}

class DCommand extends BaseCommand {}

class ECommand extends BaseCommand {}

// 组合单个 Command
class ABCommand extends compose({
  aCommand: ACommand,
  bCommand: BCommand,
}) {
  active(name: string, age: number) {
    this.aCommand.active(name)；
  }

  dispose() {}
}

// 组合以后的 Command 依然可以被组合
// 不等同于 compose([ACommand, BCommand, DCommand])
class ABDCommand extends compose({
  abCommand: ABCommand,
  dCommand: DCommand,
}) {

}

// 创建应用唯一的 Box
class DemoCommandBox extends BaseCommandBox {
  // 使用独立的 Command
  aCommand = new ACommand(this);

  eCommand = new ECommand(this);

  // 使用合成的 Command
  abdCommand =  new ABDCommand(this);

  constructor() {
    super();
    // 默认启用一个指令
    this.aCommand.apply();
  }

  disposeAll() {
    this.aCommand.select.clearAllSelected();
    this.eCommand.dispose();
    // 可以访问到下层的指令实例
    this.abdCommand.abCommand.bCommand.dispose();
  }
}

const demoCommandBox = new DemoCommandBox();
```

## 事件交互管理框架
主要实现了 2d、3d 场景中的交互系统、快捷键系统、坐标系系统、自定义合成事件的实现及管理

此框架对于用户来说通常只会用到快捷键系统，其他功能一般是和其他子框架配合使用

快捷键的使用方式：
```ts
HotKey.on({
  /**
   * 快捷键字符
   *
   * 单个：'ctrl+a'
   *
   * 多个：['ctrl+a', 'ctrl+b', 'meta+a']
   */
  key: Key.Escape,
  handler: () => {},
});

HotKey.off(Key.Escape, () => {});
```

## 视图渲染框架
顾名思义，这块主要处理图形视图如何组织与展现以及如何透传事件，目前视图层有无外部依赖的渲染框架，也有基于 react 封装的框架（暂停维护）。

> 推荐使用无外部依赖的版本，性能更好、内存开销更小，是个纯粹的针对图形场景的渲染器。

它的目的就是利用数据驱动视图、声明式、响应式表达的思路来做图形业务，以达到类似于做 web 页面的开发体感，低成本上手 web 2d/3d 业务，它把上面的几个子框架全部串联了起来，将事件传递到交互层，交互层及 model 层处理数据，数据自动响应式驱动视图更新。甚至基于视图层框架的 API，还可以封装很多图形基础组件及业务组件，进一步提效。

基于这套框架，开发者也不需要关心图形相关的知识，不需要自己去实现繁琐的功能，比如相机、灯光、场景、父子视图关联创建与卸载、坐标系转换、事件冒泡机制、图形组件与 web 组件混用、如何利用离屏渲染模拟多视口及处理对应交互、抗锯齿、resize、对象拾取、基于响应式数据框架的精细化更新渲染任务队列等等功能。所有能力可以通过简单的声明和调用方式完成。

web 3d 工程领域是一个小众领域，市面上大部分 web 3d 业务并不复杂在业务逻辑本身，更多是追求离线渲染、效果，不像游戏领域有那么多业务逻辑要写。图形学及 2d、3d 编程的门槛较高较垂直，而 web 2d/3d 更是一个小分支，市面上的人才较少，做渲染、写 shader、做端游的不屑于做 web 3d 工程/业务，而 web 前端想要做 3d 业务还是有一些陡峭的学习曲线和踩坑成本。开发这套框架的初衷是希望能达到降低入门门槛、上手成本，将职责分离，让业务跑的更快更好（开发者学一些基本的几何及代数知识即可上手）

视图层框架有一个核心库 renderer-core（对应的依赖 react 的旧版视图框架 graphic-view 已暂停维护），它抽象了整个视图框架整体的核心流程与基本交互规则，基于这个核心库可以快速低成本的去适配任意 2d、3d 图形引擎 API，做出对应这个引擎的视图层框架实现，它们可以与 turbox 生态无缝协作。

视图层框架对用户来说常用的就 Scene、Mesh、ViewEntity 三个概念，其余的细节看 ts 提示及注释，这里不再罗列。

Scene 对应的就是场景，可能有 Scene2D 的实现，也有可能有 Scene3D 的实现；Mesh 则是一个图形或模型的最小物理表达单元，通常它是只处理模型显示逻辑，它是不可交互的；而 ViewEntity 则是一个最小可交互实体单元，一个 ViewEntity 对应的交互单元可能会包含 N 个 Mesh 来显示它，比如一个门窗是一个交互实体，但是门窗是由玻璃、型材、扇组件、以及一些对应的交互控件如选中框、hint 框等 Mesh 组件组成的。

理解了基本概念之后，我们来看一下它的使用方式：
```tsx
// 用无 react 依赖的渲染器来渲染
@Reactive
export class FrontView extends Component {
  render() {
    const wall = doorWindowStore.global.walls[doorWindowStore.global.cWallIndex];
    if (!wall) {
        return null;
    }
    const viewport = doorWindowStore.scene.viewStyles.front;
    const cameraPos = { x: wall.position.x + wall.size.x / 2, y: wall.position.y + wall.size.y / 2 };
    return [{
      component: Scene2D,
      props: {
        id: 'front-scene-2d'
        commandBox: appCommandBox,
        container: SCENE_2D,
        viewport,
        camera2dSize: { x: wall.size.x, y: wall.size.y + 1000 },
        coordinateType: 'front',
        cameraPosition: cameraPos,
        transparent: false,
        backgroundColor: 0xE6E9EB,
        resizeTo: SCENE_2D,
        children: [{
          component: Axis2d,
          props: {
            type: 'front',
          }
        }, {
          component: DoorWindowView,
          props: {
            model,
            id: model.id,
            type: DoorWindowEntityType.DoorWindowVirtual,
          },
          key: model.id,
        }],
      },
      key: 'xxx',
    }];
  }
}

// 2d 下的立面场景，用 react 来渲染
@ReactiveReact
export class FrontView extends React.Component {
  render() {
    const wall = doorWindowStore.global.walls[doorWindowStore.global.cWallIndex];
    if (!wall) {
        return null;
    }
    const viewport = doorWindowStore.scene.viewStyles.front;
    const cameraPos = { x: wall.position.x + wall.size.x / 2, y: wall.position.y + wall.size.y / 2 };
    return (
      <Scene2D
        id="front-scene-2d"
        commandBox={appCommandBox}
        container={SCENE_2D}
        viewport={viewport}
        camera2dSize={{ x: wall.size.x, y: wall.size.y + 1000 }}
        coordinateType="front"
        cameraPosition={cameraPos}
        transparent={false}
        backgroundColor={0xE6E9EB}
        resizeTo={SCENE_2D}
      >
        <Axis2d type="front" />
        {/** 使用 ViewEntity 组件需要传 id 和 type，标识它是什么类型的实体，对应的 id 是什么 */}
        <DoorWindowView key={model.id} model={model} id={model.id} type={DoorWindowEntityType.DoorWindowVirtual} />
      </Scene2D>
    );
  }
}

// 一个 ViewEntity2D 交互实体单元
interface IProps extends IViewEntity {
  model: DoorWindowPDMEntity;
  zIndex?: RenderOrder;
}

@ReactiveReact
export class DoorWindowView extends ViewEntity2D<IProps> {
  // 响应式管线，组件第一次 mount 或重新 render 时会按照顺序执行，管线中的每个任务都被 reactive 函数包裹，拥有响应式的能力，也就是说只有当依赖的属性变化时，才会触发该任务的重新执行，以此达到视图层的精细化更新，提高性能（比如只是材质变了，就重新计算材质相关的任务，只是位置变了就计算位置相关的任务
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale,
  ];

  render() {
    const { model } = this.props;
    // 实体可能还会包含其他可交互实体（如子部件、连接点交互控件等），也可能包含其他 Mesh 组件（如选中或 hint、碰撞展示的边框图形控件）
    const mullions: JSX.Element[] = [];
    const areas: JSX.Element[] = [];
    const linkNode: JSX.Element[] = [];
    model.linkVertexes.forEach((child) => {
      linkNode.push(<LinkVertexView key={child.id} model={child} id={child.id} type={DoorWindowEntityType.LinkVertex} />);
    });
    model.children.forEach((child) => {
      if (PDMCategory.isMullion(child) && !child.isHidden) {
        mullions.push(<MullionView key={child.id} model={child} id={child.id} type={DoorWindowEntityType.Mullion} />);
      } else if (PDMCategory.isAreaVirtual(child)) {
        areas.push(<AreaView key={child.id} model={child} id={child.id} type={DoorWindowEntityType.AreaVirtual} />);
      }
    });
    this.view.alpha = model.isInteractive ? 1 : 0.3;
    const isSelected = appCommandBox.defaultCommand.select.getSelectedEntities().includes(model);
    const isHinted = appCommandBox.defaultCommand.hint.getHintedEntity() === model;
    if (isSelected) {
      this.view.zIndex = RenderOrder.SelectionWireFrame;
    } else if (isHinted) {
      this.view.zIndex = RenderOrder.HintWireFrame;
    } else {
      this.view.zIndex = RenderOrder.DEFAULT;
    }
    const collisional = doorWindowStore.collision.entities.includes(model);
    // 使用无 react 依赖的渲染器，需要改成对应的语法
    return (
      <React.Fragment>
        {areas}
        {mullions}
        {linkNode}
        {isSelected &&
          <Polygon
            path={model.box2Front}
            fillAlpha={0}
            lineWidth={8}
            lineColor={0x327DFF}
          />
        }
        {isHinted &&
          <Polygon
            path={model.box2Front}
            fillAlpha={0}
            lineWidth={8}
            lineColor={0x27FFFF}
          />
        }
        {collisional &&
          <Polygon
            path={model.box2Front}
            fillAlpha={0}
            lineWidth={8}
            lineColor={0xff0000}
          />
        }
      </React.Fragment>
    );
  }

  private updatePosition() {
    const { position } = this.props.model;
    this.view.position.set(position.x, position.y);
  }

  private updateRotation() {
    const { rotation } = this.props.model;
    this.view.rotation = rotation.z * MathUtils.DEG2RAD;
  }

  private updateScale() {
    const { scale } = this.props.model;
    this.view.scale.set(scale.x, scale.y);
  }
}

// 一个 Mesh2D 图形单元物理表达
// 多边形组件
export default class Polygon extends Mesh2D<IProps> {
  static defaultProps: Partial<IProps> = {
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: { x: 0, y: 0 },
  };
  protected view = new PIXI.Graphics();
  // 同样具有响应式管线
  protected reactivePipeLine = [
    this.updateGeometry,
    this.updateMaterial,
    this.updatePosition,
    this.updateRotation,
    this.updateScale,
  ];

  updateGeometry() {
    this.view.clear();
    const {
      path,
      lineWidth,
      lineColor,
      lineAlpha,
      fillColor,
      fillAlpha,
      zIndex,
    } = this.props;
    zIndex && (this.view.zIndex = zIndex);
    DrawUtils.drawPolygon(this.view, {
      path: path.map(p => ({ x: p.x, y: p.y })),
    }, {
      lineWidth,
      lineColor,
      lineAlpha,
      fillColor,
      fillAlpha,
    });
  }

  updateMaterial() {
    //
  }

  updatePosition() {
    // const { position } = this.props;
    // this.view.position.set(position!.x, position!.y);
  }

  updateRotation() {
    // this.view.rotation = this.props.rotation!;
  }

  updateScale() {
    // const { scale } = this.props;
    // this.view.scale.set(scale!.x, scale!.y);
  }

  // onClickable() {
  //   return true;
  // }

  // onDraggable() {
  //   return true;
  // }

  // onHoverable() {
  //   return true;
  // }
}

// 另一种方式，直接重写 draw 接口，每次重新 render 都会驱动 draw 重新执行，但不推荐使用，尤其在复杂图形情况下，尽量采用上面那种响应式精细化更新的写法
@Reactive
export class MullionMesh2D extends Mesh2D<IMeshProps> {
  protected view = new PIXI.Graphics();

  draw() {
    this.view.clear();
    drawMullion(this.view, this.props.model);
  }

  // onClickable() {
  //   return false;
  // }

  // onDraggable() {
  //   return false;
  // }

  // onHoverable() {
  //   return false;
  // }
}
```

> ViewEntity 本身也有对应的一个容器节点（可能是 THREE.Group 或者 PIXI.Container 或者其他引擎对应的概念），可以在组件中通过 ```this.view``` 访问，它 render 的内容的坐标系是相对于这个容器节点的，这跟图形领域的父子节点关系相对应，可以简化视图层的显示逻辑

> Mesh 本身也有对应的一个图形展示对象节点（可能是 THREE.Object3D 或者 PIXI.DisplayObject 或者其他引擎对应的概念），可以在组件中通过 ```this.view``` 访问

> 你还可以通过 onClickable，onDraggable，onHoverable 等钩子来实现该实体的动态交互功能，比如有时候需要禁用某些实体的可交互能力，那么可能它就不会在场景中被 pick 出来，有时候根据某些逻辑又要动态开放出来

> 在使用 react 渲染的框架下，场景组件也是一个 react 组件，可以和普通的 web 组件混在一起使用，看使用场景（无 react 依赖的框架不能混用）

主要的使用方式就是上面这些，还有一些细节能力，通过 ts 的注释提示来查看，不再罗列

## 其他
剩下的一些包主要是公共工具函数库、数学库、以及一些通用引擎和组件库，文档看 README 和注释，其中部分内容闭源也不再展开介绍
