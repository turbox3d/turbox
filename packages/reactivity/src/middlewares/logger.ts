import { Middleware } from '../interfaces';
import { deepMerge } from '../utils/deep-merge';
import { NAMESPACE } from '../const/symbol';
import { normalNextReturn } from './common';

function createLoggerMiddleware(): Middleware {
  return () => (next) => (dispatchedAction) => {
    const { name, displayName, domain } = dispatchedAction;

    if (!domain) {
      return normalNextReturn(next, dispatchedAction);
    }

    console.group(
      `%caction: ${name}, name: ${displayName}, namespace: ${domain[NAMESPACE]}, prev state:`,
      'color: red'
    );
    console.dir(deepMerge({}, domain.properties, { clone: true })); // deep copy，logger current state before change.
    console.groupEnd();

    return normalNextReturn(next, dispatchedAction, () => {
      if (!domain) {
        return;
      }
      console.group(
        `%caction: ${name}, name: ${displayName}, namespace: ${domain[NAMESPACE]}, next state:`,
        'color: green'
      );
      console.dir(deepMerge({}, domain.properties, { clone: true })); // deep copy，logger current state after change.
      console.groupEnd();
    });
  }
}

export default createLoggerMiddleware();
