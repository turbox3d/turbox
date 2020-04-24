import { BabelDescriptor } from '../interfaces';
import { quacksLikeADecorator } from '../utils/decorator';
import { Domain } from '../core/domain';

export interface ReactorConfig {
  deepProxy: boolean;
  isNeedRecord: boolean;
}
export function reactor(target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>): any;
export function reactor(deepProxy?: boolean, isNeedRecord?: boolean): (target: Object, name: string | symbol | number, descriptor?: BabelDescriptor<any>) => any;
/**
 * reactor decorator, making the reactor observable.
 */
export function reactor(...args: any[]) {
  const config: ReactorConfig = {
    deepProxy: true,
    isNeedRecord: true,
  };
  const decorator = function <T>(target: Object, property: string | symbol | number, descriptor?: BabelDescriptor<T>): any {
    const newDescriptor = {
      enumerable: true,
      configurable: true,
      get: function () {
        const current = (this as Domain);
        return current.propertyGet(property, config);
      },
      set: function (newVal: any) {
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

  if (quacksLikeADecorator(args)) {
    // @decorator
    return decorator.apply(null, args as any);
  }
  // @decorator(args)
  config.deepProxy = args[0] !== void 0 ? args[0] : true;
  config.isNeedRecord = args[1] !== void 0 ? args[1] : true;

  return decorator;
}
