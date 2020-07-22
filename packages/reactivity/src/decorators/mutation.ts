import { store } from '../core/store';
import { CURRENT_MATERIAL_TYPE, EMPTY_ACTION_NAME } from '../const/symbol';
import { bind, convert2UniqueString, isPromise } from '../utils/common';
import { Mutation, BabelDescriptor, DispatchedAction } from '../interfaces';
import { invariant, fail } from '../utils/error';
import { quacksLikeADecorator } from '../utils/decorator';
import { materialCallStack } from '../core/domain';
import { EMaterialType } from '../const/enums';

interface MutationConfig {
  immediately: boolean;
  name: string;
}

function createMutation(target: Object, name: string | symbol | number, original: Mutation, config: MutationConfig) {
  const stringMethodName = convert2UniqueString(name);
  return function (...payload: any[]) {
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.MUTATION;
    materialCallStack.push(this[CURRENT_MATERIAL_TYPE]);
    if (!store) {
      fail('store is not ready, please init first.');
    }
    const result = store.dispatch({
      name: stringMethodName,
      displayName: config.name || EMPTY_ACTION_NAME,
      payload,
      type: EMaterialType.MUTATION,
      domain: this,
      original: bind(original, this) as Mutation,
      immediately: config.immediately,
    });
    if (isPromise(result)) {
      return new Promise((resolve) => {
        (result as Promise<DispatchedAction>).then(() => {
          materialCallStack.pop();
          const length = materialCallStack.length;
          this[CURRENT_MATERIAL_TYPE] = materialCallStack[length - 1] || EMaterialType.DEFAULT;
          resolve();
        });
      });
    }
    materialCallStack.pop();
    const length = materialCallStack.length;
    this[CURRENT_MATERIAL_TYPE] = materialCallStack[length - 1] || EMaterialType.DEFAULT;
  };
}

export function mutation(target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<Mutation>): any;
export function mutation(name?: string, immediately?: boolean): (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<Mutation>) => any;
/**
 * decorator @mutation, update state by mutation styling.
 */
export function mutation(...args: any[]) {
  const config: MutationConfig = {
    immediately: false,
    name: '',
  };
  const decorator = (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<Mutation>): BabelDescriptor<Mutation> => {
    // typescript only: @mutation method = () => {}
    if (descriptor === void 0) {
      let mutationFunc: Function;
      return Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get: function () {
          return mutationFunc;
        },
        set: function (original: Mutation) {
          mutationFunc = createMutation(target, name, original, config);
        },
      });
    }

    // babel/typescript: @mutation method() {}
    if (descriptor.value !== void 0) {
      const original: Mutation = descriptor.value;
      descriptor.value = createMutation(target, name, original, config);
      return descriptor;
    }

    // babel only: @mutation method = () => {}
    const { initializer } = descriptor;
    descriptor.initializer = function () {
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please compile it by using babel and correspond decorator plugin.');

      return createMutation(target, name, (initializer && initializer.call(this)) as Mutation, config);
    };

    return descriptor;
  }

  if (quacksLikeADecorator(args)) {
    // @mutation
    return decorator.apply(null, args as any);
  }
  // @mutation(args)
  config.name = args[0] || '';
  config.immediately = args[1] !== void 0 ? args[1] : false;

  return decorator;
}
