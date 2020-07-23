import { Effect, Middleware } from '../interfaces';
import { actionTypeChain } from '../core/store';
import { invariant } from '../utils/error';
import { EMaterialType } from '../const/enums';
import { Action } from '../core/action';
import { materialCallStack } from '../core/domain';
import { normalNextReturn } from './common';

function createEffectMiddleware(): Middleware {
  return () => (next) => async (dispatchedAction) => {
    const { name, displayName, payload, type, original, action } = dispatchedAction;

    if (type === EMaterialType.EFFECT) {
      const length = materialCallStack.length;
      if (length > 1) {
        invariant(materialCallStack[length - 2] !== EMaterialType.MUTATION, 'Cannot trigger other effect while the current mutation is executing.');
      }

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

    return normalNextReturn(next, dispatchedAction);
  }
}

export default createEffectMiddleware();
