import { Middleware } from '../interfaces';
import { normalNextReturn } from './common';
import { EMPTY_ACTION_NAME } from '../const/symbol';
import { ctx } from '../const/config';
import { materialCallStack } from '../utils/materialCallStack';

function createPerfMiddleware(): Middleware {
  return () => next => (dispatchedAction) => {
    if (!ctx.middleware.perf) {
      return normalNextReturn(next, dispatchedAction);
    }
    const { name, displayName } = dispatchedAction;
    const start = performance.now();

    const length = materialCallStack.stack.length;
    if (ctx.middleware.skipNestPerfLog && length !== 1) {
      return normalNextReturn(next, dispatchedAction);
    }

    return normalNextReturn(next, dispatchedAction, () => {
      const end = performance.now();
      console.log(
        `%c[TURBOX PERF]: ${name} ${displayName !== EMPTY_ACTION_NAME ? displayName : ''} ${(end - start).toFixed(3)}ms`,
        'background: #FA54FF; color: #fff; font-weight: bold; padding: 3px 5px;',
      );
    });
  };
}

export default createPerfMiddleware();
