import { bind, convert2UniqueString, isPromise, invariant, fail, quacksLikeADecorator } from '@turbox3d/shared';
import { store } from '../core/store';
import { EMPTY_ACTION_NAME, MATERIAL_TYPE } from '../const/symbol';
import { Mutation, BabelDescriptor } from '../interfaces';
import { Domain } from '../core/domain';
import { EMaterialType } from '../const/enums';
import { materialCallStack } from '../utils/materialCallStack';

interface MutationConfig {
  immediately: boolean;
  displayName?: string;
}

function createMutation(target: object | undefined, name: string | symbol | number, original: Mutation, config: MutationConfig) {
  const stringMethodName = convert2UniqueString(name);
  const mutationWp = function (...payload: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let _this = this;
    if (!target) {
      _this = new Domain();
    }
    const stackId = materialCallStack.push({ type: EMaterialType.MUTATION, method: stringMethodName, domain: _this.constructor.name });
    if (!store) {
      fail('store is not ready, please init first.');
    }
    const result = store.dispatch({
      name: stringMethodName,
      displayName: config.displayName || EMPTY_ACTION_NAME,
      payload,
      type: EMaterialType.MUTATION,
      domain: _this,
      original: bind(original, _this) as Mutation,
      immediately: !!config.immediately,
      stackId
    });
    if (isPromise(result)) {
      return new Promise((resolve) => {
        (result as Promise<any>).then((res) => {
          materialCallStack.pop();
          resolve(res);
        });
      });
    }
    materialCallStack.pop();
    if (result && result instanceof Error) {
      throw result;
    }
    return result;
  };
  mutationWp[MATERIAL_TYPE] = EMaterialType.MUTATION;
  return mutationWp;
}

export function mutation(target: object, name: string | symbol | number, descriptor?: BabelDescriptor<Mutation>): any;
export function mutation(displayName?: string, immediately?: boolean): (target: object, name: string | symbol | number, descriptor?: BabelDescriptor<Mutation>) => any;
export function mutation(name: string | symbol | number, original: Mutation, config?: MutationConfig): (...payload: any[]) => any;
/**
 * decorator @mutation, update state by mutation styling.
 */
export function mutation(...args: any[]) {
  const config: MutationConfig = {
    immediately: false,
    displayName: '',
  };
  if (typeof args[0] === 'string' && typeof args[1] === 'function') {
    if (args[2] !== void 0) {
      config.displayName = args[2].displayName;
      config.immediately = args[2].immediately;
    }
    const name = args[0];
    const original = args[1];
    if (original[MATERIAL_TYPE] === EMaterialType.MUTATION) {
      return original;
    }
    return createMutation(undefined, name, original, config);
  }
  const decorator = (target: object, name: string | symbol | number, descriptor?: BabelDescriptor<Mutation>): BabelDescriptor<Mutation> => {
    // typescript only: @mutation method = () => {}
    if (descriptor === void 0) {
      let mutationFunc: Function;
      return Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get() {
          return mutationFunc;
        },
        set(original: Mutation) {
          if (original[MATERIAL_TYPE] === EMaterialType.MUTATION) {
            mutationFunc = original;
          } else {
            mutationFunc = createMutation(target, name, original, config);
          }
        },
      });
    }

    // babel/typescript: @mutation method() {}
    if (descriptor.value !== void 0) {
      const original: Mutation = descriptor.value;
      if (original[MATERIAL_TYPE] === EMaterialType.MUTATION) {
        descriptor.value = original;
      } else {
        descriptor.value = createMutation(target, name, original, config);
      }
      return descriptor;
    }

    // babel only: @mutation method = () => {}
    const { initializer } = descriptor;
    descriptor.initializer = function () {
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please compile it by using babel and correspond decorator plugin.');
      const original = (initializer && initializer.call(this)) as Mutation;
      if (original[MATERIAL_TYPE] === EMaterialType.MUTATION) {
        return original;
      }
      return createMutation(target, name, original, config);
    };

    return descriptor;
  };

  if (quacksLikeADecorator(args)) {
    // @mutation
    // eslint-disable-next-line prefer-spread
    return decorator.apply(null, args as any);
  }
  // @mutation(args)
  config.displayName = args[0] || '';
  config.immediately = args[1] !== void 0 ? args[1] : false;

  return decorator;
}
