import { Effect, EMaterialType, Middleware } from '../interfaces';

function createEffectMiddleware(): Middleware {
  return ({ dispatch }) => (next: any) => async (action) => {
    const { name, payload, type, domain, original } = action;

    if (type === EMaterialType.EFFECT) {
      const effect = original as Effect;
      try {
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
