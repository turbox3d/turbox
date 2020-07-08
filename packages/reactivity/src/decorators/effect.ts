import { store } from '../core/store';
import { CURRENT_MATERIAL_TYPE, EMPTY_ACTION_NAME } from '../const/symbol';
import { bind, convert2UniqueString } from '../utils/common';
import { Effect, BabelDescriptor } from '../interfaces';
import { invariant, fail } from '../utils/error';
import { quacksLikeADecorator } from '../utils/decorator';
import { materialCallStack } from '../core/domain';
import { EMaterialType } from '../const/enums';
import { Action } from '../core/action';

interface EffectConfig {
  name: string;
}

/**
 * @todo: enhance effect feature, such as takeLead, takeLast
 */
function createEffect(target: Object, name: string | symbol | number, original: Effect, config: EffectConfig) {
  const stringMethodName = convert2UniqueString(name);
  return async function (...payload: any[]) {
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.EFFECT;
    materialCallStack.push(this[CURRENT_MATERIAL_TYPE]);
    if (!store) {
      fail('store is not ready, please init first.');
    }
    const action = Action.create(stringMethodName, config.name);
    await store.dispatch({
      name: stringMethodName,
      action,
      displayName: config.name || EMPTY_ACTION_NAME,
      payload,
      type: EMaterialType.EFFECT,
      domain: this,
      original: bind(original, this) as Effect,
    });
    action.complete();
    materialCallStack.pop();
    const length = materialCallStack.length;
    this[CURRENT_MATERIAL_TYPE] = materialCallStack[length - 1] || EMaterialType.DEFAULT;
  };
}

export function effect(target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<Effect>): any;
export function effect(name?: string): (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<Effect>) => any;
/**
 * decorator @effect, handle some async process and effect.
 */
export function effect(...args: any[]) {
  const config: EffectConfig = {
    name: '',
  };
  const decorator = (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<Effect>) => {
    // typescript only: @effect method = async () => {}
    if (descriptor === void 0) {
      let effectFunc: (...payload: any[]) => Promise<void>;
      return Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get: function () {
          return effectFunc;
        },
        set: function (original: Effect) {
          effectFunc = createEffect(target, name, original, config);
        },
      });
    }

    // babel/typescript: @effect method() {}
    if (descriptor.value !== void 0) {
      const original: Effect = descriptor.value;
      descriptor.value = createEffect(target, name, original, config);
      return descriptor;
    }

    // babel only: @effect method = () => {}
    const { initializer } = descriptor;
    descriptor.initializer = function () {
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please compile it by using babel and correspond decorator plugin.');

      return createEffect(target, name, (initializer && initializer.call(this)) as Effect, config);
    };

    return descriptor;
  }

  if (quacksLikeADecorator(args)) {
    // @effect
    return decorator.apply(null, args as any);
  }
  // @effect(args)
  config.name = args[0] || '';

  return decorator;
}
