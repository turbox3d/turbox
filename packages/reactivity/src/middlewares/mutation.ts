import { EMaterialType, Middleware } from '../interfaces';
import { actionTypeChain } from '../core/store';

function createMutationMiddleware(): Middleware {
  return () => (next: any) => (action) => {
    const { name, displayName, type, isInner } = action;
    if (isInner || (type !== EMaterialType.MUTATION && type !== EMaterialType.UPDATE)) {
      return next(action);
    }

    actionTypeChain.push({
      name,
      displayName,
    });

    return next(action);
  };
}

export default createMutationMiddleware();
