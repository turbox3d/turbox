import { compose, fail } from '@turbox3d/shared';
import { Middleware, Store } from '../interfaces';
import { Action } from './action';
import { actionTypeChain } from './store';
import { depCollector } from './collector';

export const middlewares: Array<Middleware> = [];

/**
 * Add middleware.
 */
export function use(middleware: Middleware | Array<Middleware>, inner = true) {
  const arr = Array.isArray(middleware) ? middleware : [middleware];
  if (inner) {
    middlewares.unshift(...arr);
  } else {
    middlewares.push(...arr);
  }
}

export function applyMiddleware() {
  return (createStore: any): Store => {
    const store = createStore();
    let dispatch: any = () => {
      fail('Dispatching while constructing your middleware is not allowed. ' +
        'Other middleware would not be applied to this dispatch.');
    };
    const exposedMethod = {
      getActionChain: () => {
        if (Action.context) {
          return Action.context.historyNode.actionChain.slice();
        }
        return actionTypeChain.slice();
      },
      getDependencyGraph: () => new Map(depCollector.dependencyGraph),
      dispatch: (...args: any[]) => dispatch(...args),
    };
    const runnerChain = middlewares.map(middleware => middleware(exposedMethod));

    dispatch = compose(...runnerChain)(store.dispatch);

    return {
      ...store,
      dispatch,
    };
  };
}
