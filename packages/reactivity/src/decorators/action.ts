import { convert2UniqueString, isPromise, bind, invariant, quacksLikeADecorator } from '@turbox3d/shared';
import { BabelDescriptor } from '../interfaces';
import { Action } from '../core/action';
import { EMaterialType } from '../const/enums';
import { MATERIAL_TYPE } from '../const/symbol';
import { mutation, MutationConfig } from './mutation';

interface ActionConfig {
  displayName: string;
  /** 是否自动包裹一个顶层 mutation */
  isWrapMutation: boolean;
  /** 自动包裹的 mutation 的配置 */
  mutationConfig?: MutationConfig;
}

type ActionCallback = (...payload: any[]) => void | Promise<void>;

function createAction(target: object | undefined,
  name: string | symbol | number,
  original: ActionCallback,
  config: ActionConfig,
) {
  const stringMethodName = convert2UniqueString(name);
  const actionWp = function (...payload: any[]) {
    const currentAction = Action.create(stringMethodName, config.displayName);
    const bindOriginal = bind(original, this);
    let wp: (...payload: any[]) => void | Promise<void>;
    if (config.isWrapMutation) {
      wp = mutation(name, bindOriginal, config.mutationConfig);
    } else {
      wp = bindOriginal;
    }
    const result = currentAction.execute(wp, payload);
    if (isPromise(result)) {
      return new Promise((resolve, reject) => {
        (result as Promise<any>).then((res) => {
          currentAction.complete();
          resolve(res);
        }, (err) => {
          currentAction.abort();
          reject(err);
        });
      });
    }
    currentAction.complete();
    return result;
  };
  actionWp[MATERIAL_TYPE] = EMaterialType.ACTION;
  return actionWp;
}

export function action(target: object, name: string | symbol | number, descriptor?: BabelDescriptor<any>): any;
export function action(displayName?: string, isWrapMutation?: boolean, mutationConfig?: MutationConfig): (target: object, name: string | symbol | number, descriptor?: BabelDescriptor<any>) => any;
export function action(name: string | symbol | number, original: ActionCallback, config?: ActionConfig): (...payload: any[]) => any;
/**
 * decorator @action, handle undo/redo action.
 */
export function action(...args: any[]) {
  const config: ActionConfig = {
    displayName: '',
    isWrapMutation: true,
    mutationConfig: undefined,
  };
  if (typeof args[0] === 'string' && typeof args[1] === 'function') {
    if (args[2] !== void 0) {
      config.displayName = args[2].displayName;
      config.isWrapMutation = args[2].isWrapMutation;
      config.mutationConfig = args[2].mutationConfig;
    }
    const name = args[0];
    const original = args[1];
    if (original[MATERIAL_TYPE] === EMaterialType.ACTION) {
      return original;
    }
    return createAction(undefined, name, original, config);
  }
  const decorator = (target: object, name: string | symbol | number, descriptor?: BabelDescriptor<any>) => {
    // typescript only: @action method = async () => {}
    if (descriptor === void 0) {
      let actionFunc: Function;
      return Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get() {
          return actionFunc;
        },
        set(original: ActionCallback) {
          if (original[MATERIAL_TYPE] === EMaterialType.ACTION) {
            actionFunc = original;
          } else {
            actionFunc = createAction(target, name, original, config);
          }
        },
      });
    }

    // babel/typescript: @action method() {}
    if (descriptor.value !== void 0) {
      const original: ActionCallback = descriptor.value;
      if (original[MATERIAL_TYPE] === EMaterialType.ACTION) {
        descriptor.value = original;
      } else {
        descriptor.value = createAction(target, name, original, config);
      }
      return descriptor;
    }

    // babel only: @action method = () => {}
    const { initializer } = descriptor;
    descriptor.initializer = function () {
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please compile it by using babel and correspond decorator plugin.');
      const original = (initializer && initializer.call(this)) as ActionCallback;
      if (original[MATERIAL_TYPE] === EMaterialType.ACTION) {
        return original;
      }
      return createAction(target, name, original, config);
    };

    return descriptor;
  };

  if (quacksLikeADecorator(args)) {
    // @action
    // eslint-disable-next-line prefer-spread
    return decorator.apply(null, args as any);
  }
  // @action(args)
  config.displayName = args[0] || '';
  config.isWrapMutation = args[1] !== void 0 ? args[1] : true;
  config.mutationConfig = args[2] !== void 0 ? args[2] : undefined;

  return decorator;
}
