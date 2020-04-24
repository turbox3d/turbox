# Sticky
[![pipeline status](https://gitlab.qunhequnhe.com/fe/packages/sticky/badges/master/pipeline.svg)](https://gitlab.qunhequnhe.com/fe/packages/sticky/pipelines)
[![npm version](http://npm-registry.qunhequnhe.com:7002/badge/v/@qunhe/sticky.svg?style=flat-square)](http://npm-registry.qunhequnhe.com:7000/package/sticky)
[![coverage report](https://gitlab.qunhequnhe.com/fe/packages/sticky/badges/master/coverage.svg)](http://fe-runner.qunhequnhe.com/gzip/qunhe-sticky/coverage/lcov-report/index.html)

## Introduction
**Sticky** is a state management framework for react apps.

### Principle

#### react-redux
![redux](//qhstaticssl.kujiale.com/as/ddae6a4d54ba1e65b5833508fd59ff5c/redux.png)

#### react-mobx & vuex
The principle of the mobx and vuex have the same point. A lot of people said, react-mobx just give a way to write react code for vuer. Funny, but we mustn't write reducer function truly.
![mobx](//qhstaticssl.kujiale.com/as/654ae258534c4b8c8f5b21f8f1282e52/mobx.png)
![vuex](//qhstaticssl.kujiale.com/as/e738c068c874a74d0192c83b039980e9/vuex.png)

#### sticky
![sticky](//qhstaticssl.kujiale.com/as/512d87c0cb4a54c1fbfdecac41da7a77/sticky.png)

### Data Flow
![flow](//qhstaticssl.kujiale.com/as/24c745d400703eee45c127b5bffc2bb4/data-flow.png)

## Installation
```
$ npm install --save @qunhe/sticky

$ yarn add @qunhe/sticky
```
### Dependency
Sticky requires **react-dom, react 16 or later.**

### Browser Compatibility
Sticky is supported by most modern browsers except IE, because of sticky use **proxy and reflect**
- Edge
- Chrome 49+
- Safari 10+
- Firefox 18+
- Opera 36+
- Safari iOS
- Android

### License
[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, feifan <darknight3@vip.qq.com>

## API & Concept

### Materiel
We call the following object as a materiel, the object includes "reducers", "effects", "initialState" and "scope".
```js
import { actions, states } from '@qunhe/sticky';

{
  reducers: {
    modifyRightTxt(state, payload) {
      return {
        ...state,
        rightTxt: payload,
      };
    },
    deleteItem(state, payload) {
      return Immutable.fromJS(state)
        .updateIn(['dataList'], list => list.filter(item => item.toJSON().id !== payload))
        .toJSON()
    },
  },
  effects: {
    async fetchData(data) {
      actions.$global.loadingData();
      await new Promise((resolve) => {
        setTimeout(resolve, 3000);
      });
      const baseInfo = await apiBase.getBaseInfo();
      // If we want to access current materiel's state, just use "this" indicator.
      if (baseInfo.user && data === 'hello' && this.leftTxt === 'testLeft') {
        // Access current materiel's reducer
        this.modifyRightTxt('change to right txt');
      }
      // Sometimes, we want to access other module's state
      console.log(states.$list.listTxt);
      actions.$global.loadedData();
    },
    async doSomething() {
      // Access current materiel's effect
      await this.fetchData('hello');
      // Access other module's materiel
      actions.$list.listLoaded();
    },
  },
  initialState: {
    dataList: [{ id: 1, txt: 'xxx' }, { id: 2, txt: 'ccc' }],
    leftTxt: 'testLeft',
    rightTxt: 'testRight'
  },
  scope: 'header'
}
```
As a literal meaning, reducers is a reducer map, we can write reducer function like **redux**. Differently, sticky provide another way to write reducer, like mutations in **vuex**.
```js
modifyRightTxt(state, payload) {
  state.people.name = 'bbb';
  state.people.age = 20;
  state.rightTxt = payload;
}
```

Sticky provides default middleware to handle the effect function, so you don't need to use the third party's middleware like **redux-thunk**, just write the async function to handle the api call.

Every materiel has "scope" field, it's a meaningful field, we can implement locality reducer, effect and initial state by the field, in large application, use scope can help us maintain the application easily, we can only focus the current scope logic, and we can find the dependencies on current scope easily.

### Register
Register function be used to register materiel in store. But you must register materiel before render, otherwise you might be get error.

Also you can register it lazy to improve the performance, it would be useful when your single page application work in with "code split" feature of webpack.
```js
import Sticky from '@qunhe/sticky'

Sticky.register(materiel)
```
You cannot register reducer, effect, initial state that have duplicate of name, or you would get error that prompt you select another name.

One scope can only be register once, or you will get warning. The second register behavior wouldn't be successful actually, it would cache the first register materiel.

### Stick
We can use stick decorator to inject state like the following code.
```js
import { stick } from '@qunhe/sticky'

@stick('headerView', {
  data: ({ $header, $global, $list }) => ({
    ...$header,
    isFetching: $global.isFetching,
    isLoading: $list.isLoading,
  })
})
class Header extends PureComponent {
  render() {
    const { parent, dataList, leftTxt, rightTxt, isFetching, isLoading } = this.props
    return (
      <div className="seminar-header">
        test
      </div>
    )
  }
}
```
Stick function pass a string parameter as the unique "viewId", the second parameter is an object, you must specify "data" function to inject state from different scope.

Actually, "viewId" also be used to represent a component template id, this id is important, **sticky** will use the id to connect update listeners and dependency state. The principle is `Dependency Collection` actually.

Data is a function to inject different scope's state. This function's param is the whole state, you can get every registered scope's state.

### Actions
We can use actions api to call reducer or effect function.

When we call method, we should be add **$** symbol before scope, like this format: `actions.${{scope}}.{{methodName}}()`
```js
import { actions } from '@qunhe/sticky'

class Header extends PureComponent {
  render() {
    const { parent, dataList, leftTxt, rightTxt, isFetching, isLoading } = this.props
    return (
      <div className="seminar-header">
        <button onClick={() => actions.$list.listLoading()}>test other module's state</button>
        <Left txt={leftTxt}
          modifyRightTxt={() => actions.$header.doSomething()}
          list={dataList}
          deleteItem={(id) => actions.$header.deleteItem(id)} />
        <Right txt={rightTxt} />
        <span>test global state：{isFetching.toString()}</span>
        <span>test from parent component props：{parent}</span>
        <span>test from list module's isLoading state：{isLoading.toString()}</span>
      </div>
    )
  }
}
```

### Render
In most situation, we just call sticky render function to handle everything, sticky already help us completed most of the preparatory works, such as init store, init default middlewares, mount on the dom and so on.
```js
import Sticky from '@qunhe/sticky'

Sticky.render(<Layout switch={false} />, '#app', () => {
  console.log('render component tree done!')
})
```

### Middleware
In sticky, we have already provided **logger** and **effect** middleware.
- logger: help us track state changing process, like **redux-logger**.
- effect: help us handle action effects, like **redux-thunk**.

Sometimes, we need some extra custom or third party's middlewares to handle the action stream.
```js
import Sticky from '@qunhe/sticky'
import { createEpicMiddleware } from 'redux-observable'

Sticky.use(({ dispatch }) => next => (action) => {
  return next(action)
})
// if we have multiple middlewares
Sticky.use([({ dispatch }) => next => (action) => {
  return next(action)
}, createEpicMiddleware()])
```

### Plugin
Sometimes, we want to load some plugins to avoid import plugins in every files.
```js
import Sticky from '@qunhe/sticky'
import dataManager from '@qunhe/data-manager'
import i18n from '@qunhe/i18n'

Sticky.install({
  'dataManager': dataManager,
  'i18n': i18n
})

// we can use plugins in template
class Header extends PureComponent {
  render() {
    const result = this.$dataManager.get('/api')

    return (
      <div className="seminar-header">
        {this.$i18n('tab.help')}{result}
      </div>
    )
  }
}

// or use plugins in effects and reducers
Sticky.register({
  reducers: {
    modifyRightTxt(state, payload) {
      const result = this.$dataManager.get('/api')
      return {
        ...state,
        rightTxt: `${payload}${result}`,
      }
    }
  },
  effects: {
    async doSomething() {
      await this.$dataManager.get('/api')
    }
  }
})
```

### Computed

## Tools

### vscode plugin

### chrome dev tool

## Best Practice
