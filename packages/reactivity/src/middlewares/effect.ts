import { Effect, Middleware } from '../interfaces';
import { isUpdating, actionTypeChain } from '../core/store';
import { invariant } from '../utils/error';
import { EMaterialType } from '../const/enums';
import { Action } from '../core/action';

function createEffectMiddleware(): Middleware {
  return () => (next: any) => async (dispatchedAction) => {
    const { name, displayName, payload, type, original, action } = dispatchedAction;

    if (type === EMaterialType.EFFECT) {
      invariant(!isUpdating, 'Cannot trigger other effect while the current mutation is executing.');

      const effect = original as Effect;
      try {
        actionTypeChain.push({
          name,
          displayName,
        });
        await effect(action as Action, ...payload);
      } catch (error) {
        return error;
      }
      return;
    }

    return next(dispatchedAction);
  }
}

export default createEffectMiddleware();
