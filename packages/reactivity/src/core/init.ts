import { applyMiddleware, use } from './use'
import { createStore } from './store'
import effectMiddleware from '../middlewares/effect'
import mutationMiddleware from '../middlewares/mutation';
import loggerMiddleware from '../middlewares/logger'
import { ctx } from '../const/config'
import { compose } from '../utils/compose';
import { invariant } from '../utils/error';
import { isSupportProxy, isSupportSymbol } from '../utils/lang';
import { Emitter } from '../utils/common';

export let isRunning = false;
export const emitter = new Emitter();
/**
 * Includes init built-in middleware, create store, load domain tree and so on.
 */
export function init() {
  if (isRunning) {
    return;
  }
  invariant(isSupportProxy() && isSupportSymbol(), 'Proxy or Symbol is not supported, please add polyfill.');

  isRunning = true;

  use(effectMiddleware);
  use(mutationMiddleware);

  if (ctx.middleware.logger) {
    use(loggerMiddleware);
  }

  const enhancers = [applyMiddleware()];
  let composeEnhancers = compose;

  if (process.env.NODE_ENV !== 'production') {
    // Turbox dev tools extension support.
  }

  const enhancer = composeEnhancers(...enhancers);

  createStore(enhancer);

  emitter.emit('storeOnActive');
}
