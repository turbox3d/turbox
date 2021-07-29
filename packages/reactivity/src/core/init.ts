import { compose, invariant, isSupportProxy, isSupportSymbol, isPromise } from '@turbox3d/shared';
import { applyMiddleware, use } from './use';
import { createStore } from './store';
// import effectMiddleware from '../middlewares/effect';
import mutationMiddleware from '../middlewares/mutation';
import loggerMiddleware from '../middlewares/logger';
import perfMiddleware from '../middlewares/perf';
import { triggerCollector } from './collector';
import { EEventName, emitter } from '../utils/event';
import { TimeTravel } from './time-travel';
import { mutation } from '../decorators/mutation';
import { TURBOX_PREFIX } from '../const/symbol';

// eslint-disable-next-line import/no-mutable-exports
export let isRunning = false;

function clean() {
  triggerCollector.endBatch();
  TimeTravel.clear();
}

/**
 * Includes init built-in middleware, create store, load domain tree and so on.
 */
export function init(callback?: () => void | Promise<void>): void | Promise<void> {
  clean();
  invariant(isSupportProxy() && isSupportSymbol(), 'Proxy or Symbol is not supported, please add polyfill.');

  if (!isRunning) {
    use(perfMiddleware);
    // use(effectMiddleware);
    use(mutationMiddleware);
    use(loggerMiddleware);

    const enhancers = [applyMiddleware()];

    if (process.env.NODE_ENV !== 'production') {
      // Turbox dev tools extension support.
    }

    const enhancer = compose(...enhancers);
    createStore(enhancer);
    emitter.emit(EEventName.storeOnActive);
  }

  isRunning = true;

  if (!callback) {
    return;
  }
  const f = mutation(`${TURBOX_PREFIX}init`, callback, {
    immediately: true,
    displayName: '',
  });
  const result = f();

  if (isPromise(result)) {
    // eslint-disable-next-line consistent-return
    return (result as Promise<void>).then(() => {
      clean();
    });
  }
  clean();
}
