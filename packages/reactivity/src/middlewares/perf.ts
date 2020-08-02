import { Middleware } from '../interfaces';
import { normalNextReturn } from './common';
import { materialCallStack } from '../core/domain';

function createPerfMiddleware(): Middleware {
  return () => (next) => (dispatchedAction) => {
    const { name, displayName } = dispatchedAction;
    const start = performance.now();

    const length = materialCallStack.length;
    if (length !== 1) {
      return normalNextReturn(next, dispatchedAction);
    }

    return normalNextReturn(next, dispatchedAction, () => {
      const end = performance.now();
      console.log(name, displayName, `${(end - start).toFixed(3)}ms`);
    });
  };
}

export default createPerfMiddleware();
