import { Middleware } from '../interfaces';
import { deepMerge } from '../utils/deep-merge';
import { NAMESPACE } from '../const/symbol';

function createLoggerMiddleware(): Middleware {
  return ({ dispatch }) => (next: any) => (action) => {
    if (!action.domain) {
      return next(action);
    }

    console.group(
      `%caction: ${action.name}, namespace: ${action.domain[NAMESPACE]}, prev state:`,
      'color: red'
    );
    console.dir(deepMerge({}, action.domain, { clone: true })); // deep copy，logger current state before change.
    console.groupEnd();

    const nextResult = next(action); // wait the result of the next middleware

    console.group(
      `%caction: ${action.name}, namespace: ${action.domain[NAMESPACE]}, next state:`,
      'color: green'
    );
    console.dir(deepMerge({}, action.domain, { clone: true })); // deep copy，logger current state after change.
    console.groupEnd();

    return nextResult;
  }
}

export default createLoggerMiddleware();
