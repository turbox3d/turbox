import { bind, shallowEqual } from '../common';
import { deepMerge } from '../deep-merge';

describe('utils -> common', () => {
  it('deepMerge', () => {
    const obj = deepMerge({
      name: {
        test: 'xxx',
        dd: false,
        obj: {
          name: 'x11',
          c: 'xxdf'
        },
        arr: ['xxx', 'vvv'],
        und: undefined,
        testnull: null,
        objarr: [{ n: 'x', a: 23 }, { n: 'cv', a: 223 }]
      },
      dataList: [{ name: '1', age: 2 }, { name: '1', age: 2 }]
    }, {
        name: {
          test: 'xxx',
          dd: false,
          num: 2.342,
          obj: {
            name: 'ddf',
            c: 'xxdf',
          },
          arr: ['xxx', 'vvv'],
          und: undefined,
          testnull: null,
          objarr: [{ n: 'x', a: 23 }, { n: 'cv', a: 223 }]
        },
        dataList: [{ name: '1', age: 2 }, { name: '1', age: 3 }, { name: '12', age: 4 }]
      });
    expect(obj).toEqual({
      name: {
        test: 'xxx',
        dd: false,
        num: 2.342,
        obj: {
          name: 'ddf',
          c: 'xxdf',
        },
        arr: ['xxx', 'vvv'],
        und: undefined,
        testnull: null,
        objarr: [{ n: 'x', a: 23 }, { n: 'cv', a: 223 }]
      },
      dataList: [{ name: '1', age: 2 }, { name: '1', age: 3 }, { name: '12', age: 4 }]
    });
  })

  it('deepMergeClone', () => {
    const obj = deepMerge({
      name: {
        test: 'xxx',
        dd: false,
        obj: {
          name: 'x11',
          c: 'xxdf'
        },
        arr: ['xxx', 'vvv'],
        und: undefined,
        testnull: null,
        objarr: [{ n: 'x', a: 23 }, { n: 'cv', a: 223 }]
      },
      dataList: [{ name: '1', age: 2 }, { name: '1', age: 2 }]
    }, {
        name: {
          test: 'xxx',
          dd: false,
          num: 2.342,
          obj: {
            name: 'ddf',
            c: 'xxdf',
          },
          arr: ['xxx', 'vvv'],
          und: undefined,
          testnull: null,
          objarr: [{ n: 'x', a: 23 }, { n: 'cv', a: 223 }]
        },
        dataList: [{ name: '1', age: 2 }, { name: '1', age: 3 }, { name: '12', age: 4 }]
      }, { clone: true });
      expect(obj).toEqual({
        name: {
          test: 'xxx',
          dd: false,
          num: 2.342,
          obj: {
            name: 'ddf',
            c: 'xxdf',
          },
          arr: ['xxx', 'vvv'],
          und: undefined,
          testnull: null,
          objarr: [{ n: 'x', a: 23 }, { n: 'cv', a: 223 }]
        },
        dataList: [{ name: '1', age: 2 }, { name: '1', age: 3 }, { name: '12', age: 4 }]
      });
  })

  it('shallowEqual', () => {
    const isEqual = shallowEqual({
      name: {
        test: 'xxx',
        dd: false,
        num: 2.342,
        obj: {
          name: 'x11',
          c: 'xxdf'
        },
        arr: ['xxx', 'vvv'],
        und: undefined,
        testnull: null,
        objarr: [{ n: 'x', a: 23 }, { n: 'cv', a: 223 }]
      },
      dataList: [{ name: '1', age: 2 }, { name: '1', age: 2 }]
    }, {
        name: {
          test: 'xxx',
          dd: false,
          num: 2.342,
          obj: {
            name: 'x11',
            c: 'xxdf',
          },
          arr: ['xxx', 'vvv'],
          und: undefined,
          testnull: null,
          objarr: [{ n: 'x', a: 23 }, { n: 'cv', a: 223 }]
        },
        dataList: [{ name: '1', age: 2 }, { name: '1', age: 3 }]
      })
    expect(isEqual).toBeFalsy()
  })

  it('bind', () => {
    const originalObj = {
      say: function () {
        return this.baz
      }
    }
    const targetObj = {
      baz: 'baz'
    }
    const fn = bind(originalObj.say, targetObj)
    expect(fn()).toBe('baz')
  })
})
