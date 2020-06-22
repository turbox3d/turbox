import { reactive } from '../core/reactive';
import { depCollector, triggerCollector } from '../core/collector';
import { ECollectType, ESpecialReservedKey } from '../const/enums';
import { BabelDescriptor } from '../interfaces';
import { quacksLikeADecorator } from '../utils/decorator';
import { bind } from '../utils/common';

export interface ComputedOption {
  /** suspend compute value if it is not observed */
  lazy: boolean;
}

export interface ComputedRef<T> {
  enumerable?: boolean;
  configurable?: boolean;
  get: () => T;
  set?: (value: any) => void;
}

export function computed(target: Object, property: string | symbol | number, descriptor?: BabelDescriptor<any>): any;
export function computed(options?: Partial<ComputedOption>): (target: Object, property: string | symbol | number, descriptor?: BabelDescriptor<any>) => any;
export function computed<T>(computeRunner: () => T, options?: Partial<ComputedOption>): ComputedRef<T>;

/**
 * decorator @computed, computed(() => {}), handle computed value.
 */
export function computed<T>(...args: any[]) {
  if (typeof args[0] === 'function') {
    let value: T;
    let dirty = true;
    let needReComputed = false;
    let needTrigger = false;
    let computedRef: ComputedRef<T>;
    const computeRunner = args[0];
    const options = args[1];
    const lazy = options && options.lazy !== void 0 ? options.lazy : true;

    const reaction = reactive(() => {
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
    };

    return computedRef;
  }

  let value: T;
  let dirty = true;
  let needReComputed = false;
  let needTrigger = false;
  let computedRef: ComputedRef<T>;
  let computeRunner: () => T;
  let options: ComputedOption | undefined;

  const decorator = (target: Object, property: string | symbol | number, descriptor?: BabelDescriptor<any>): any => {
    const lazy = options && options.lazy !== void 0 ? options.lazy : true;
    const reaction = reactive(() => {
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
      enumerable: true,
      configurable: true,
      get: function () {
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
      set: function (original) {
        computeRunner = bind(original, this);
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
      get: function () {
        if (!computeRunner) {
          computeRunner = bind(descriptor.get, this) as (() => T);
        }
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
      set: descriptor.set,
    };

    return computedRef;
  };

  if (quacksLikeADecorator(args)) {
    // @computed
    return decorator.apply(null, args as any);
  }
  // @computed(args)
  options = args[0];

  return decorator;
}
