import { Middleware, Store } from '../interfaces';
import { compose } from '../utils/compose';
import { fail } from '../utils/error';

export const middlewares: Array<Middleware> = [];

/**
 * Add middleware.
 */
export function use(middleware: Middleware | Array<Middleware>) {
  const arr = Array.isArray(middleware) ? middleware : [middleware];
  middlewares.push(...arr);
}

export function applyMiddleware() {
  return (createStore: any): Store => {
    const store = createStore();
    let dispatch: any = () => {
      fail(`Dispatching while constructing your middleware is not allowed. ` +
        `Other middleware would not be applied to this dispatch.`);
    };
    const exposedMethod = {
      // getState: store.getState,
      dispatch: (...args: any[]) => dispatch(...args),
    };
    const runnerChain = middlewares.map(middleware => middleware(exposedMethod));

    dispatch = compose(...runnerChain)(store.dispatch);

    return {
      ...store,
      dispatch
    };
  }
}
