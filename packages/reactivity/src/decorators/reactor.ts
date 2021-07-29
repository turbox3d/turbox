import { quacksLikeADecorator, isPlainObject, includes } from '@turbox3d/shared';
import { BabelDescriptor } from '../interfaces';
import { Domain, collectionTypes } from '../core/domain';
import { DEFAULT_FIELD_NAME } from '../const/symbol';

export const meta = {
  freeze: false,
};

export interface ReactorConfig {
  deepProxy: boolean;
  isNeedRecord?: boolean;
  displayName: string;
  callback?: (target: object, property: string) => void;
}

/**
 * reactor decorator, making the reactor observable.
 */
export function reactor<T extends object>(value: object, config?: Omit<ReactorConfig, 'deepProxy'>): T;
export function reactor(target: object, property: string, descriptor?: BabelDescriptor<any>): any;
export function reactor(deepProxy?: boolean, isNeedRecord?: boolean, callback?: (target: object, property: string) => void): (target: object, property: string, descriptor?: BabelDescriptor<any>) => any;
export function reactor(...args: any[]) {
  const config: ReactorConfig = {
    deepProxy: true,
    displayName: '',
  };
  const decorator = function (target: object, property: string, descriptor?: BabelDescriptor<any>): any {
    const newDescriptor = {
      enumerable: true,
      configurable: true,
      get() {
        const current = (this as Domain);
        if (config.callback) {
          const f = () => {
            meta.freeze = true;
            config.callback && config.callback.call(current, current, property);
            meta.freeze = false;
          };
          !meta.freeze && f();
        }
        return current.propertyGet(property, config);
      },
      set(newVal: any) {
        const current = (this as Domain);
        current.propertySet(property, newVal, config);
      },
    };

    // typescript only: (exp: @reactor() name: string = 'someone';)
    if (descriptor === void 0) {
      return Object.defineProperty(target, property, newDescriptor);
    }

    // babel only: (exp: @reactor() name = 'someone';)
    return newDescriptor;
  };
  if (isPlainObject(args[0]) || Array.isArray(args[0]) || (args[0] && args[0].constructor && includes(collectionTypes, args[0].constructor))) {
    const param = args[1] as ReactorConfig;
    if (param) {
      param.displayName !== void 0 && (config.displayName = param.displayName);
      param.isNeedRecord !== void 0 && (config.isNeedRecord = param.isNeedRecord);
      param.callback !== void 0 && (config.callback = param.callback);
    }
    const domain = new Domain();
    const propKey = config.displayName || DEFAULT_FIELD_NAME;
    const ins = decorator(domain, propKey);
    ins[propKey] = args[0];
    return ins[propKey];
  }

  if (quacksLikeADecorator(args)) {
    // @decorator
    // eslint-disable-next-line prefer-spread
    return decorator.apply(null, args as any);
  }
  // @decorator(args)
  config.deepProxy = args[0] !== void 0 ? args[0] : true;
  if (args[1] !== void 0) {
    config.isNeedRecord = args[1];
  }
  config.callback = args[2];

  return decorator;
}
