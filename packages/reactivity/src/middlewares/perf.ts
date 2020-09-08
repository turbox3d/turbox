import { Middleware } from '../interfaces';
import { normalNextReturn } from './common';
import { materialCallStack } from '../core/domain';
import { EMPTY_ACTION_NAME } from '../const/symbol';

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
      console.log(
        `%c[TURBOX PERF]: ${name} ${displayName !== EMPTY_ACTION_NAME ? displayName : ''} ${(end - start).toFixed(3)}ms`,
        'background: #FA54FF; color: #fff; font-weight: bold; padding: 3px 5px;'
      );
    });
  };
}

export default createPerfMiddleware();
