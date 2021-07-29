
turbox 框架的定位是大型 web 图形业务应用的前端框架，CAX 应用开箱即用的引擎及库。场景主要来源于大型 web 3d 设计制造一体化编辑器业务

turbox 框架包含几个子框架：

* 响应式数据流事务框架（框架无关，目前有 for react）
* 指令管理框架
* 事件交互管理框架
* 视图框架（引擎无关，目前有 2d for pixi、3d for 集团内部渲染引擎，未来在移动端可能会有 for hilo3d 引擎）
* 设计引擎（类 web CAX 应用的通用引擎及库）
* 生产智造引擎（在设计引擎和公式约束求解引擎上的一层封装）
* 基于 three 扩展的数学库，主要是一些常用几何算法和容差的支持
* 基于视图框架封装的 CAX 常用图形控件，比如尺寸标注、Gizmo 等

本文主要还是先介绍响应式数据流事务框架，其他的部分等后续逐渐完善并开源后再陆续更新

## 响应式数据流事务框架

turbox 响应式数据流事务框架是包含了事务、撤销重做、中间件机制的响应式流派状态管理，但会更针对 3d 前端场景设计，本文尽量只介绍原理，不涉及框架本身的 API 介绍，如需了解，可以移步官方文档查看 https://github.com/turbox3d/turbox （文档大约滞后一年，需要走内部披露审批后再更新代码及文档）

### 架构图
![image.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/ae3327b4ebb0db4a2c24e091939ad7ea.png)

### 装饰器的使用
在我们的 3d 前端应用中，通过面向对象来建立模型关系，各个模型之间都有复杂的引用关联关系，所以在设计属性代理的时候需要考虑到不干扰 class 本身的特性，如继承多态等，所以用装饰器和基类的方式来做设计是一种比较干净的方式。

当然传统 web ui 更多的是存一些简单的状态和数据，比如 plain object 或者说是树状的模型，框架同样也提供了函数式的 API，来支持动态化函数名，松散的代码组织方式，各有场景。

设计一个装饰器 API，除了要考虑类型推导写对以外，也得考虑到
* ts 下、babel 下的装饰器实现是不一致的情况
* 得支持传参和不传参的写法
* 箭头函数和成员函数的表现
* 属性装饰器和函数装饰器以及类装饰器的区别

装饰器其实到目前为止都是个非正式的提案，在 js 下，我们可以通过 babel 插件来支持，babel 下的装饰器实现不在这里说了，要提醒的是：babel 下不管是箭头函数还是成员函数，descriptor 始终都是存在的，而 ts 下属性装饰器的第三个参数 descriptor 是不存在的，箭头函数也会被认为是属性，赋值了一个函数的属性，所以需要特殊考虑下

如果是成员函数，不管 ts 还是 babel 表现是一致的，我们可以通过改写 descriptor.value 实现函数的覆写

而如果是 babel 下的箭头函数，babel 做了特殊的事情，会给编译后的代码生成一个 initializer 的函数，所以你也同样需要改写 initializer 函数，区别在于，原始的 initializer 函数的返回值才是被包裹的 original 函数，你得执行一下，如下代码所示：

```js
  const decorator = (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<Mutation>): BabelDescriptor<Mutation> => {
    // typescript only: @mutation method = () => {}
    if (descriptor === void 0) {
      let mutationFunc: Function;
      return Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get: function () {
          return mutationFunc;
        },
        set: function (original: Mutation) {
          mutationFunc = createMutation(target, name, original, config);
        },
      });
    }

    // babel/typescript: @mutation method() {}
    if (descriptor.value !== void 0) {
      const original: Mutation = descriptor.value;
      descriptor.value = createMutation(target, name, original, config);
      return descriptor;
    }

    // babel only: @mutation method = () => {}
    const { initializer } = descriptor;
    descriptor.initializer = function () {
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please compile it by using babel and correspond decorator plugin.');

      return createMutation(target, name, (initializer && initializer.call(this)) as Mutation, config);
    };

    return descriptor;
  }
```

装饰器可以传参 `@reactor(arg) a = '123'` 也可以不传参 `@reactor a = '123'` 这就需要判断一下入参是否是符合 target，key，descriptor 这三个参数，但其实也只有 hack 的做法，比如下面代码所示：

```js
function quacksLikeADecorator(args: any[]): boolean {
  return (args.length === 2 || args.length === 3) && typeof args[1] === 'string'
}
```
因为并不存在校验装饰器入参的方法，但是如果是框架层面，其实是可以保证正确性的，只要保证传入装饰器的参数类型别和 target，key，descriptor 一致就行了

### 代理机制
turbox 在几年前就已经坚持使用 Proxy 来做数据代理了，因为当时我们的业务只需要支持 chrome，用 Proxy 可以让代码变得更简单，也支持更多数据结构和方法的截持，并且 Proxy 已经是一个稳定的 API。

首先，我们不会对一个 class 的所有属性做代理，肯定只是对装饰器修饰的那些属性做代理，并且不会干扰 class 本身的作用，所以在第一层级依然是通过 Object.defineProperty 来实现属性代理：

```js
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

```js
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
* 一些其他特殊 API

大家都知道 Proxy 可以截持很多特殊情况，但是实际上要支持各种数据结构和场景，并没有想象的那么容易

比如 Proxy 也一样只会支持第一级 get key 的代理，如果要支持深层属性的依赖收集和代理，必须得使用递归，当然这个过程是它每次被 get 的时候才会做，并且需要做对应的双缓冲机制，防止重复创建  proxy 实例：

```js
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

```js
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

### 非法赋值检测
什么是非法赋值检测，这就得先说一下背景。在框架层面，其实是不允许在 mutation 以外的范围直接对数据做更改的，为什么要做这个限制呢？因为我们并不希望所有的数据更新零散在代码的各个角落，而是有个地方能明确收敛所有的数据更新操作，这样才会有利于组织我们的代码，也不会和非响应式的属性更新混在一起，也才能做一些撤销恢复事务的机制。

基于上面的前提条件，我们是不希望用户在 mutation 以外的范围做更新的，所以我们得提供一个报错机制来约束用户，没有这个机制的话数据和视图就不同步了。

所以在每一次 set 的时候，我们都会做一个检测，判断这个属性是否在指定合法范围内调用，当然这个其实只在开发时检测就够了，生产环境可以关闭以提高一丢丢性能：

```js
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
但是光这样还不够，因为必然会存在一些 mutation 范围以外的赋值是不能去禁止的，比如初始化的时候，new 的时候，所以才为什么有上面代码里的那个判断 `depCollector.isObserved` 这个判断就是说当这个属性已经被代理过了，那么后面的更新必须经过检查，如果没有被视图同步过，那么可以在任何地方初始化。

### 依赖收集与触发
* 利用 defineProperty 和 Proxy 来做代理，劫持访问符和赋值，收集依赖、触发依赖
* 利用栈来存储 reaction id，结束时出栈，跟执行栈保持一致，react 下可以改写 render，触发时调用 forceUpdate，普通回调就是重新执行该回调

建立组件树实例 id 和对应依赖的关系，跟执行栈保持一致：
![截屏2020-09-07 上午12.13.52.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/2de48fd5840ee884dedd9c8583461e6b.png)

依赖树的数据结构：
![image.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/d629055cfc9d79dadae2bcd1d635773b.png)

触发依赖只需要去依赖树中找到对应的 reactionId，即可触发对应的重新渲染或回调

有依赖收集必然有依赖淘汰机制，当属性不再被依赖到这个 reactive 视图或函数后，就应该移除依赖，不然会触发不该触发的重绘，为了不阻塞渲染，我们通过反向建立一颗状态树来存储依赖的状态，这样我们就可以把依赖淘汰移动到渲染完成后再去做，而不是每次暴力清除再重建：

第一次我们都标记为 latest：
![image.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/872f157b552a9efa6389657af0adb09f.png)

收集后我们把依赖都标记为 observed：
![截屏2020-09-06 下午4.19.35.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/fd5a7517d1355da5b869a8a6b09b4f5e.png)

再次更新后，把这次依赖到的属性标记为 latest：
![截屏2020-09-06 下午4.19.43.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/f9dee29c57f49ab466cc29177a3e796d.png)

那么在这次收集完成后，我们只要把 latest 置为 observed，把 observed 的置为 not observed 的，然后把 not observed 的依赖清除掉即可：
![截屏2020-09-06 下午4.20.22.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/a53765a31769d77b8070dd50cf935293.png)

### 数据更新
虽然是响应式数据流，但是并不希望那么灵活，在实际的业务开发中，我们依然还是需要类似 action 或者说指令的概念，之前也有提到为什么需要包在 mutation 里做更新，因为底层我仍然需要有撤销恢复、渲染时机的控制、中间件等机制，所以不管你怎么响应式，我底层就是个 `store.dispatch` 只不过那肯定是要比 redux 复杂的多，才能实现这些能力，流程图如下：
![image.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/a748c72182ce66328dfde6cdd4e6def9.png)

这里简单提一下副作用这个概念，这个概念应该是 redux 提出来的，有这个概念的原因是一次数据的 snapshot 对应一个视图状态，当一次 action 操作产生了两次或多次对应的视图状态，则被认为是副作用，通常发生在异步场景。而在 turbox reactivity 中，所谓的副作用其实用个 async 函数就能体现，await 之前比如是一次数据更新，await 之后是另一次，甚至都不应该叫做副作用。

但有时候我们也需要忽略副作用，比如我们有一些改柜子参数的场景，改参数会触发拉取公式，然后通过公式进行耗时的复杂计算，最后才算完成，这个过程是个异步的，但是这个过程本身计算的中间结果我们并不希望立刻反馈到视图或回调逻辑上，这就需要忽略这个副作用，等到这个完整操作执行完才反馈到视图，作为一个独立的步骤。这种情况可以使用异步的 mutation 来支持。

### 计算属性
计算属性其实就是一种特殊的 reactive，有依赖变化需要重新计算，没有则直接用上一次的值，区别就在于它有返回值，需要缓存计算值，需要做惰性求值，脏值标记和 keepAlive 的功能：

```js
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

### 中间件机制
我们想要的其实就是类似 koa 的洋葱模型，实现原理就不用多说了，通过 reduce 和 middleware chain 来做，turbox reactivity 的中间件机制是支持异步的，当然传入的参数也会不太一样，提供了获取行为链、依赖图、dispatch 等能力，同时也内置了一些基本的中间件，部分可通过配置开关。

### Action 机制
turbox 的 action 机制指的是一个事务，一个步骤，而不是 web 场景中的一个 action 的概念。

在 turbox 中有主动事务和被动事务的概念

主动事务：
举个例子，在一些建模业务中，我需要画一个轮廓，我先画一个点，再画一根线，再画一个点，直到完成一个封闭图形才算完成了这个组合操作，而这些绘制行为其实都不是在一个同步执行栈中完成的，也就是说对于渲染来说，我确实是完成一个动作就得有一份对应的视图渲染出来，但对于撤销恢复来说，显然我撤销的不是最后一次画线的操作，而是撤销整个画轮廓的步骤，这就是我们要的主动事务机制，而决定事务什么时候开始，事务什么时候结束是强依赖业务逻辑的，所以我们得提供灵活的 API，让用户可以通过调用简单的 API 完成它想要的功能。

被动事务：
主动事务可以最大化的灵活控制事务的粒度，但是对于大多数场景，一个事件触发的一个行为基本上就是一个步骤，如果每一次我都要设置开始和结束，以及调用或者初始化一堆乱七八糟的中间类和函数，那会导致开发效率非常低下，尤其是我们这种 web ui 和 3d 场景兼有的业务场景。所以比较理想的方式就是默认是被动事务，加上主动事务辅助。被动事务其实就是上面提到的更新流程一节，只要记住一个数据的 snapshot 对应一个视图的渲染，就可以了，加上副作用、控制渲染时机的机制，已经足够满足需要。

当然我们业务中也会有更复杂一些的场景，比如做一个门板切割的行为，我可以连续切割，但是也有可能做了一系列操作之后放弃了，那需要退回某个节点的状态，如果要靠代码（逆向操作）去实现，是非常麻烦的，要知道模型的数据非常庞大且复杂，且一次操作不仅仅只是操作模型数据，即使是通过暴力 normalizr 也有局限性，比如性能问题、丢数据问题，只要靠“人和规范”解决的问题一定是不稳定的容易出错的，所以我们才需要通过框架提供的 Action API 来做 abort、revert 等功能，减少人工做这些事情出错的概率。

另外还有一些异步竞争的场景会比较复杂，但我说的竞态复杂还没有复杂到需要动用 rxjs 或者 saga 这样的库来解决，这样的库能解决一些问题，但是也会带来新的问题，如果使用者的水平和理解没有达到同一水平线，等于是搬起石头砸自己的脚，并且在这种既有业务里，rx 的理念更多的是希望作为一个插件用进来，而不是必选项。

所以我举的例子其实也比较简单，比如同时有三个异步事务在执行，这时候有这样一个需求，当满足某个条件的时候，我需要抛弃掉指定的前面几次事务，只保留最后一次，这就要求框架需要提供一个事务池，让使用者可以灵活控制这些事务。如下图：
![截屏2020-09-06 下午5.26.18.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/644e982521e44537b1ed8c66a0c5cbde.png)

不仅要暂停前面两次事务往后执行，也要回退掉已经发生的变化，不然会导致状态错乱：
![截屏2020-09-06 下午5.26.25.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/a5192f9f737e17d58ff99de7b4c85b97.png)

等到全部完成清理掉事务池中的前面两次事务：
![截屏2020-09-06 下午5.26.30.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/1202d609b72b65e0c3f3240a9f08b210.png)

当然这只是比较简单的例子，实际场景中会有更多应用

### 撤销恢复
撤销恢复依赖于前面我们提到的属性修改的代理，每一次修改我们都会记录状态修改的类型和修改之前的值、修改之后的值，将修改记录暂存，当然在一个步骤内的修改是会被合并的。

框架提供的撤销恢复操作其实是一种特殊的 mutation（不记录 actionChain 和 history），根据修改类型执行不同的赋值或还原操作：

```js
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

看到这里，一定有童鞋有疑问，撤销恢复记录的是引用类型怎么办？直接赋值引用类型难道没有问题吗？

这个其实是个惯性思维，因为以前我们认为要做撤销恢复，必须得 normalizr 转成扁平化的 plain object 数据才可以做，这个思路其实是对的，这是做一个完美的撤销恢复机制的方案，虽然看上去挺粗暴的，但至少可以保证解决引用值被修改的问题。缺点就是如果要拷贝的整个引用类型数据量很大，一方面会牺牲很多转换过程中的时间性能，另一方面也会占用很多额外内存空间（在 3d 业务中除了本身的模型数据，还有大量生产参数数据，这种做法在这种业务场景中是完全不可用的，随便做一二个复杂步骤，就有内存直接崩溃的案例）。

所以问题的点在于我们到底需不需要一个完美的撤销恢复方案，对于我遇到的实际业务场景，我的回答是不需要。我希望通过实现一个满足业务但所谓”不完美“的撤销恢复方案来换取性能上的优势。

实际上我们操作具体状态的变更的时候，大部分情况都是在赋值基本数据类型，因为只有这些数据，才能真实的在需要渲染的场景被读取出来或拿来用，比如一个嵌套对象 `{ a: { b: { c: 1 } } }` 我们肯定不会直接去用 `a.b` 因为它是一个对象，但是我们一定会去读 `a.b.c` 比如在界面显示一个数量，这是一个具体的值，即使你真的需要使用一个引用类型的属性的时候，也一定是类似这样的场景：

`parent = new Cabinet()` 然后这时候更新了 parent，`parent = new Door()`，撤销恢复的时候，退到了 parent 为 cabinet 实例引用的情况，如果这时候有别的地方把 cabinet 实例的值修改了，下一次再退回来的时候，有的童鞋会担心两次结果不一样，不符合预期。其实完全不用担心这种情况，因为修改 cabinet 实例上的属性这个操作本身也会被记录下来，所以只要叠加上去，引用的值也会被正确的撤销恢复，只要这个属性是被 reactor 装饰器修饰为响应式的。

只有一种情况会出现差异，就是这个引用值不在框架的控制范围，是一个自己外部创建的引用类型，并且不是响应式的，比如把 reactor 的第一个参数 deepProxy 设置成了 false，那么框架肯定代理不到引用内部的结构了，比如某个模型渲染所需要的 metadata 或者顶点材质数据，这时候你去改这个对象，是不会被记录的，两次撤销的结果自然也会不一样，但这种问题实际上根本不存在，因为既然你都取消了深度代理，还想改属性引发变更，一定是要通过 immer.js 或者 immutable.js 来做拷贝赋值的，把引用改掉，不然的话当然不起作用了。

另一个要注意的点是，基于 diff 的撤销恢复，始终是在当前一个已知应用程序状态下进行前进后退的，除了不能跳步以外，如果你要通过 diff 数据来恢复现场也是做不到的，因为丢失了其他数据，所以要完整还原，肯定还是要做序列化操作持久化到后端。实际上很多竞技游戏也会用类似的办法来做现场恢复、断线重连、replay 等，虽然我没做过游戏，但实现思路基本也是差不多的，实时发送下一帧的 diff 数据包，或是全量数据包来传输对方玩家的动作，这也是为啥网游非常依赖带宽和传输稳定性。

另外，即使是基于 diff，依然还是会有内存占满的可能，diff 只对修改部分状态起到较大的优化效果，如果是类似一些替换、重算轮廓等几乎更新了所有数据的场景，并没有什么优势。真实场景中的撤销恢复还是要结合前后端一起来做，以达到释放端上内存压力的效果。

当然撤销恢复也得支持暂停、重启，多个撤销恢复队列，切换队列，清空等功能，这都是我们业务需要的场景。

最后附上一张简单的图：
![image.png](https://ata2-img.oss-cn-zhangjiakou.aliyuncs.com/cdc19140bdcc1cd3190743ee22aec6e3.png)

## 指令管理框架
简单来说，这是一个处理图形 entity 交互逻辑的管理器，不同于 web，图形业务中的交互事件通常会比较复杂，由多个事件组合完成，并且也会处理比较多的临时计算、事务等逻辑，有些临时计算还需要反馈到界面上，该框架主要目的是解决如何更好的内聚、扩展、启用卸载交互模块，以达到复用、组合出不同的交互指令，让业务开发更高效、可维护性更高，不耦合视图层和 model 层

## 事件交互管理框架
主要实现了 2d、3d 场景中的交互系统、坐标系系统、自定义合成事件的实现及管理

## 视图层框架
顾名思义，这块主要处理图形视图如何组织与展现以及如何透传事件，目前视图层是基于 react 封装的框架，后期也许会替换掉内核。

它的目的就是如何利用数据驱动视图的思路来做图形业务，以达到类似于做 web 页面的开发体感，它把上面的几个子框架全部串联了起来，将事件传递到交互层，交互层及 model 层处理数据，数据自动响应式驱动视图更新。甚至基于视图层框架的 API，还可以封装很多图形基础组件及业务组件，进一步提效。

基于这套框架，开发者也不需要关心图形相关的知识，不需要自己去实现繁琐的功能，比如相机、灯光、场景、父子视图关联创建与卸载、坐标系转换、事件冒泡机制、图形组件与 web 组件混用、如何利用离屏渲染模拟多视口及处理对应交互、抗锯齿、resize、对象拾取、基于响应式数据框架的精细化更新渲染任务队列等等功能。所有能力可以通过简单的声明和调用方式完成。

图形学及 3d 编程的门槛较高较垂直，市面上的人才较少。利用这套框架最终达到降低入门门槛、上手成本，将职责分离，让业务跑的更快更好（开发者学一些基本的 3d 数学知识即可上手）。

### 未来的设想
今年会开始着重建设围绕 turbox 做的周边配套工具链和生态，以及基于它的行业引擎、生产模型、算法库和组件，并逐渐做好产品化与对外输出。

长远来说，希望想到新制造、web 图形编辑器，就可以想到 turbox 是首选技术框架。毕竟我们应该是业界第一个做同源一体化设计编辑器的前端团队，也将会是挖的最深的前端团队。目前 turbox 已经服务于阿里大家居业务大大小小的业务系统与设计制造编辑器，未来还将进一步扩展边界。

最后介绍一下我所在的团队：我们是阿里巴巴淘系技术部 ihome 技术前端团队，我们是一支具备制造业、图形学基因的技术群体，有着最复杂最有前景的业务赛道（躺平），团队内很多各个领域的真资深大佬，欢迎有志之士前来挑战或加入我们，内推、实习可发送简历到 feifan.gff@alibaba-inc.com

### 总结
先推荐两篇看下来讲得不错的文章：
* Towards a unified theory of reactive UI
* Becoming fully reactive: an in-depth explanation of MobX

虽然跟框架本身可能关系不大，但是读一读肯定是有收获的，当然本文肯定也不是在论证 why not redux，why not mobx，why not xxx，这个官方文档上都有，更多的是解释一些设计原因和原理，虽然写的不好。

最后就是我在前端框架和架构领域大概也做了好多年时间了，3d 领域也做了二年，当然后端、工程化各种乱七八糟的方向也都做过，负责过大大小小的业务项目，坚持业余时间也写点代码，我一直觉得这不是一个好的方向，因为做这个方向的人太多了，也很难论证价值，门槛也低，相信很多人有这个困惑。

但从我自己的经验回头来看，这可能是业务同学最好的方向了，也是为数不多能做的方向，因为根本不存在一个所谓”万金油“的方案，越是复杂的业务越是要针对性的做业务架构，而很多时候如果你不贴着业务走，你不了解这个行业，钻到业务里面去，你根本没有什么灵感，也一定不会做出一个对业务真正有价值的技术方案。我建议如果有机会，都可以尝试做一下技术 PM 去主导业务推进业务，它可以让技术同学更能以”行业“的角度去看待技术问题，深入理解业务，而不是由技术硬推业务。

另外一点，造个技术方案出来不难，往往是怎么落地，怎么伴随业务一起成长，怎么具体情况具体分析比较难，同样的业务，放到不同的公司，差异都非常大，怎么在不同的情况、组织、背景下解决各类问题，才是我认为在商业公司环境下，技术人长远需要具备的能力。

当然对于这类结合业务的轮子来说，对社区可能并没有特别大的贡献，实际上大部分轮子也都是很难有什么颠覆性的创新，无非还是在思考解决某个子领域的针对性通用问题，更多的也只是提供一个思路和成功实践的案例，不过这也足够了。
