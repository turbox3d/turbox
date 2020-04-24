import { applyMiddleware, use } from '../core/use'
import { createStore } from '../core/store'
import effectMiddleware from '../middlewares/effect'
import loggerMiddleware from '../middlewares/logger'
import { ctx } from '../const/config'
import { compose } from '../utils/compose';
import { invariant } from '../utils/error';
import { isSupportProxy, isSupportSymbol } from '../utils/lang';

export let isRunning = false;
/**
 * Includes init built-in middleware, create store, load domain tree and so on.
 */
export function init() {
  invariant(isSupportProxy() && isSupportSymbol(), 'Proxy or Symbol is not supported, please add polyfill.');
  invariant(!isRunning, 'Cannot init store multiple times.');

  isRunning = true;

  if (ctx.middleware.effect) {
    use(effectMiddleware);
  }

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
}
