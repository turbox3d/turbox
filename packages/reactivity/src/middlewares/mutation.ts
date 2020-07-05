import { Middleware } from '../interfaces';
import { actionTypeChain } from '../core/store';
import { EMaterialType } from '../const/enums';
import { Action } from '../core/action';

function createMutationMiddleware(): Middleware {
  return () => (next: any) => (dispatchedAction) => {
    const { name, displayName, type, isInner } = dispatchedAction;
    if (isInner || (type !== EMaterialType.MUTATION && type !== EMaterialType.UPDATE)) {
      return next(dispatchedAction);
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

    return next(dispatchedAction);
  };
}

export default createMutationMiddleware();
