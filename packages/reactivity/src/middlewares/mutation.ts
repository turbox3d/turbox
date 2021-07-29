import { Middleware } from '../interfaces';
import { actionTypeChain } from '../core/store';
import { EMaterialType } from '../const/enums';
import { Action } from '../core/action';
import { normalNextReturn } from './common';

function createMutationMiddleware(): Middleware {
  return () => next => (dispatchedAction) => {
    const { name, displayName, type, isInner } = dispatchedAction;
    if (isInner || (type !== EMaterialType.MUTATION && type !== EMaterialType.UPDATE)) {
      return normalNextReturn(next, dispatchedAction);
    }

    if (Action.context) {
      Action.context.historyNode.actionChain.push({
        name,
        displayName,
      });
    } else {
      actionTypeChain.push({
        name,
        displayName,
      });
    }

    return normalNextReturn(next, dispatchedAction);
  };
}

export default createMutationMiddleware();
