import { compose } from '../compose';

describe('utils -> compose', () => {
  it('compose', () => {
    const original = param => `original${param}`
    const middlewares = [(next) => {
      return (param) => {
        console.log('111');
        return next(param);
      }
    }, (next) => {
      return (param) => {
        console.log('222');
        return next(param);
      }
    }, (next) => {
      return (param) => {
        console.log('333');
        return next(param);
      }
    }]
    const enhanced = compose(...middlewares)(original);
    expect(enhanced('test')).toBe('originaltest');
  })

  it('compose one middleware', () => {
    const original = param => `original${param}`
    const middlewares = [(next) => {
      return (param) => {
        console.log('111');
        return next(param);
      }
    }]
    const enhanced = compose(...middlewares)(original);
    expect(enhanced('test')).toBe('originaltest');
  })

  it('compose no middleware', () => {
    const original = param => `original${param}`
    const middlewares = []
    const enhanced = compose(...middlewares)(original);
    expect(enhanced('test')).toBe('originaltest');
  })
})
