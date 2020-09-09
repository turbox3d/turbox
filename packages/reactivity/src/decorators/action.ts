import { convert2UniqueString, isPromise } from '../utils/common';
import { BabelDescriptor } from '../interfaces';
import { invariant } from '../utils/error';
import { quacksLikeADecorator } from '../utils/decorator';
import { Action } from '../core/action';

interface ActionConfig {
  displayName: string;
}

type ActionCallback = () => void | Promise<void>;

function createAction(target: Object | undefined, name: string | symbol | number, original: ActionCallback, config: ActionConfig) {
  const stringMethodName = convert2UniqueString(name);
  return function (...payload: any[]) {
    const action = Action.create(stringMethodName, config.displayName);
    const result = action.execute(original);
    if (isPromise(result)) {
      return new Promise((resolve) => {
        (result as Promise<any>).then((res) => {
          action.complete();
          resolve(res);
        });
      });
    }
    action.complete();
    return result;
  };
}

export function action(target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>): any;
export function action(name: string | symbol | number, original: ActionCallback, config?: ActionConfig): (...payload: any[]) => any;

/**
 * decorator @action, handle undo/redo action.
 */
export function action(...args: any[]) {
  const config: ActionConfig = {
    displayName: '',
  };
  if (typeof args[0] === 'string' && typeof args[1] === 'function') {
    if (args[2] !== void 0) {
      config.displayName = args[2].displayName;
    }
    return createAction(undefined, args[0], args[1], config);
  }
  const decorator = (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>) => {
    // typescript only: @action method = async () => {}
    if (descriptor === void 0) {
      let actionFunc: Function;
      return Object.defineProperty(target, name, {
        enumerable: true,
        configurable: true,
        get: function () {
          return actionFunc;
        },
        set: function (original: ActionCallback) {
          actionFunc = createAction(target, name, original, config);
        },
      });
    }

    // babel/typescript: @action method() {}
    if (descriptor.value !== void 0) {
      const original: ActionCallback = descriptor.value;
      descriptor.value = createAction(target, name, original, config);
      return descriptor;
    }

    // babel only: @action method = () => {}
    const { initializer } = descriptor;
    descriptor.initializer = function () {
      invariant(!!initializer, 'The initializer of the descriptor doesn\'t exist, please compile it by using babel and correspond decorator plugin.');

      return createAction(target, name, (initializer && initializer.call(this)) as ActionCallback, config);
    };

    return descriptor;
  };

  if (quacksLikeADecorator(args)) {
    // @action
    return decorator.apply(null, args as any);
  }
  // @action(args)
  config.displayName = args[0] || '';

  return decorator;
}
