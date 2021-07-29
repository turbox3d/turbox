import { quacksLikeADecorator } from '@turbox3d/shared';
import { createReaction } from '../core/reactive';
import { depCollector, triggerCollector } from '../core/collector';
import { ECollectType, ESpecialReservedKey } from '../const/enums';
import { Domain } from '../core/domain';

export interface ComputedOption {
  /** suspend compute value if it is not observed */
  lazy: boolean;
}

export interface ComputedRef<T> {
  enumerable?: boolean;
  configurable?: boolean;
  get?: () => T;
  set?: (value: any) => void;
  dispose?: () => void;
}

/**
 * decorator @computed, computed(() => {}), handle computed value.
 */
export function computed(target: object, property: string, descriptor?: PropertyDescriptor): any;
export function computed(options?: Partial<ComputedOption>): (target: object, property: string, descriptor?: PropertyDescriptor) => any;
export function computed<T>(computeRunner: () => T, options?: Partial<ComputedOption>): ComputedRef<T>;
export function computed<T>(...args: any[]) {
  if (typeof args[0] === 'function') {
    let value: T;
    let dirty = true;
    let needReComputed = false;
    let needTrigger = false;
    let computedRef: ComputedRef<T>;
    const computeRunner = args[0];
    const options = args[1];
    const lazy = options && options.lazy !== void 0 ? options.lazy : false;

    const reaction = createReaction(() => {
      dirty = true;
      if (needReComputed) {
        value = computeRunner();
      }
      if (needTrigger) {
        triggerCollector.trigger(computedRef, ESpecialReservedKey.COMPUTED, {
          type: ECollectType.SET,
          beforeUpdate: void 0,
          didUpdate: void 0,
        });
      }
    }, {
      name: 'computed',
      computed: true,
      lazy,
    });

    computedRef = {
      get: () => {
        if (dirty) {
          needReComputed = true;
          needTrigger = false;
          reaction.runner();
          dirty = false;
          needReComputed = false;
          needTrigger = true;
        }
        depCollector.collect(computedRef, ESpecialReservedKey.COMPUTED);
        return value;
      },
      dispose: () => {
        reaction.dispose();
      },
    };

    return computedRef;
  }

  let computedRef: ComputedRef<T>;
  let options: ComputedOption | undefined;

  const decorator = (target: object, property: string, descriptor?: PropertyDescriptor): ComputedRef<T> => {
    computedRef = {
      enumerable: true,
      configurable: true,
      get() {
        const current = (this as Domain);
        return current.computedPropertyGet<T>(property, options);
      },
      set(original) {
        const current = (this as Domain);
        current.computedPropertySet<T>(property, original);
      },
    };

    // typescript only: @computed prop = () => {}
    if (descriptor === void 0) {
      return Object.defineProperty(target, property, computedRef);
    }

    // @computed get prop() {}
    computedRef = {
      enumerable: true,
      configurable: true,
      get() {
        const current = (this as Domain);
        return current.computedPropertyGet<T>(property, options, descriptor);
      },
      set: descriptor.set,
    };

    return computedRef;
  };

  if (quacksLikeADecorator(args)) {
    // @computed
    // eslint-disable-next-line prefer-spread
    return decorator.apply(null, args as any);
  }
  // @computed(args)
  options = args[0];

  return decorator;
}
