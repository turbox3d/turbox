import { Middleware } from '../interfaces';
import { deepMerge } from '../utils/deep-merge';
import { NAMESPACE } from '../const/symbol';

function createLoggerMiddleware(): Middleware {
  return () => (next: any) => (dispatchedAction) => {
    if (!dispatchedAction.domain) {
      return next(dispatchedAction);
    }

    console.group(
      `%caction: ${dispatchedAction.name}, name: ${dispatchedAction.displayName}, namespace: ${dispatchedAction.domain[NAMESPACE]}, prev state:`,
      'color: red'
    );
    console.dir(deepMerge({}, dispatchedAction.domain.properties, { clone: true })); // deep copy，logger current state before change.
    console.groupEnd();

    const nextResult = next(dispatchedAction); // wait the result of the next middleware

    console.group(
      `%caction: ${dispatchedAction.name}, name: ${dispatchedAction.displayName}, namespace: ${dispatchedAction.domain[NAMESPACE]}, next state:`,
      'color: green'
    );
    console.dir(deepMerge({}, dispatchedAction.domain.properties, { clone: true })); // deep copy，logger current state after change.
    console.groupEnd();

    return nextResult;
  }
}

export default createLoggerMiddleware();
