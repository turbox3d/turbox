import { store } from '../core/store';
import { CURRENT_MATERIAL_TYPE, EMPTY_ACTION_NAME } from '../const/symbol';
import { bind, convert2UniqueString } from '../utils/common';
import { Mutation, EMaterialType, BabelDescriptor } from '../interfaces';
import { invariant } from '../utils/error';
import { quacksLikeADecorator } from '../utils/decorator';
import { materialCallStack } from '../core/domain';

interface MutationConfig {
  isAtom: boolean;
  name: string;
}

function createMutation(target: Object, name: string | symbol | number, original: any, config: MutationConfig) {
  const stringMethodName = convert2UniqueString(name);
  return function (...payload: any[]) {
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.MUTATION;
    materialCallStack.push(this[CURRENT_MATERIAL_TYPE]);
    store.dispatch({
      name: stringMethodName,
      displayName: config.name || EMPTY_ACTION_NAME,
      payload,
      type: EMaterialType.MUTATION,
      domain: this,
      original: bind(original, this) as Mutation,
      isAtom: config.isAtom,
    });
    materialCallStack.pop();
    const length = materialCallStack.length;
    this[CURRENT_MATERIAL_TYPE] = materialCallStack[length - 1] || EMaterialType.DEFAULT;
  };
}

export function mutation(target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>): any;
export function mutation(name?: string, isAtom?: boolean): (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>) => any;
/**
 * decorator @mutation, update state by mutation styling.
 */
export function mutation(...args: any[]) {
  const config: MutationConfig = {
    isAtom: false,
    name: '',
  };
  const decorator = (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>): any => {
    // typescript only: @mutation method = () => {}
    if (descriptor === void 0) {
      let mutationFunc: Function;
      Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get: function () {
          return mutationFunc;
        },
        set: function (original) {
          mutationFunc = createMutation(target, name, original, config);
        },
      });
      return;
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

      return createMutation(target, name, initializer && initializer.call(this), config);
    };

    return descriptor;
  }

  if (quacksLikeADecorator(args)) {
    // @mutation
    return decorator.apply(null, args as any);
  }
  // @mutation(args)
  config.name = args[0] || '';
  config.isAtom = args[1] !== void 0 ? args[1] : false;

  return decorator;
}
