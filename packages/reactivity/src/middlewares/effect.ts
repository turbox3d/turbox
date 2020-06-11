import { Effect, EMaterialType, Middleware } from '../interfaces';
import { isUpdating, actionTypeChain } from '../core/store';
import { invariant } from '../utils/error';

function createEffectMiddleware(): Middleware {
  return ({ dispatch }) => (next: any) => async (action) => {
    const { name, displayName, payload, type, domain, original } = action;

    if (type === EMaterialType.EFFECT) {
      invariant(!isUpdating, 'Cannot trigger other effect while the current mutation is executing.');

      const effect = original as Effect;
      try {
        actionTypeChain.push({
          name,
          displayName,
        });
        await effect(...payload);
      } catch (error) {
        return error;
      }
      return;
    }

    return next(action);
  }
}

export default createEffectMiddleware();
