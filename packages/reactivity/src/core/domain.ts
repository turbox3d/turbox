import { isPlainObject, hasOwn, isObject, bind, includes, invariant, generateUUID, canObserve } from '@turbox3d/shared';
import { NAMESPACE, EMPTY_ACTION_NAME, TURBOX_PREFIX } from '../const/symbol';
import { Mutation } from '../interfaces';
import { depCollector, triggerCollector } from './collector';
import { store } from './store';
import { ReactorConfig, meta } from '../decorators/reactor';
import { ECollectType, ESpecialReservedKey, EMaterialType } from '../const/enums';
import { Reaction, createReaction } from './reactive';
import { ComputedOption, computed } from '../decorators/computed';
import { ctx } from '../const/config';
import { mutation } from '../decorators/mutation';
import { action } from '../decorators/action';
import { materialCallStack } from '../utils/materialCallStack';
import { isDomain } from '../utils/common';

export enum KeyPathType {
  property = 'property',
  index = 'index',
}
export const proxyCache = new WeakMap<any, any>();
export const rawCache = new WeakMap<any, any>();
export const keyPathCache = new WeakMap<any, Array<{ type: KeyPathType; value: string }>>();
export const collectionTypes = [Map, Set, WeakMap, WeakSet];

interface DomainContext {
  isNeedRecord: boolean;
}

interface ComputedConfig<T> {
  value: T;
  dirty?: boolean;
  needReComputed?: boolean;
  needTrigger?: boolean;
  computeRunner?: () => T;
  reaction?: Reaction;
}

export type NormalCollection = Map<any, any> | Set<any>;
export type WeakCollection = WeakMap<any, any> | WeakSet<any>;
export type Collection = NormalCollection | WeakCollection;
export type MapType = Map<any, any> | WeakMap<any, any>;
export type SetType = Set<any> | WeakSet<any>;

/**
 * Framework base class 'Domain', class must be extends this base class which is need to be observable.
 */
export class Domain<S extends object = {}> {
  // prompt: add property do not forget sync to black list
  $$turboxProperties: { [key in keyof this]?: this[key] } = {};
  private reactorConfigMap: { [key in keyof this]?: ReactorConfig } = {};
  private context: DomainContext;
  private computedProperties: { [key in keyof this]?: ComputedConfig<this[key]> } = {};
  private currentTarget?: any;
  private originalArrayLength?: number;

  constructor() {
    const target = Object.getPrototypeOf(this);
    const domainName = target.constructor.name || 'TURBOX_DOMAIN';
    const namespace = `${domainName}_${generateUUID()}`;
    this[NAMESPACE] = namespace;
    this.context = this.initDomainContext();
  }

  initDomainContext(): DomainContext {
    return {
      isNeedRecord: ctx.timeTravel.isNeedRecord!,
    };
  }

  propertyGet(key: string, config: ReactorConfig, hasInitializer = false, defaultValue?: any) {
    const hasKey = key in this.$$turboxProperties; // if first initialize, will be false
    const useDefault = hasInitializer && !hasKey;
    const v = useDefault ? defaultValue : this.$$turboxProperties[key];
    if (useDefault) {
      // hasInitializer won't trigger setter when first init value, need trigger it manually
      this.propertySet(key, v, config);
    }
    const mergedConfig = Object.assign(
      {},
      {
        isNeedRecord: this.context.isNeedRecord,
      },
      config
    );
    this.reactorConfigMap[key] = mergedConfig;

    depCollector.collect(this, key);

    return isObject(v) && !isDomain(v) && mergedConfig.deepProxy
      ? this.proxyReactive(v, [{ type: KeyPathType.property, value: key }])
      : v;
  }

  propertySet(key: string, v: any, config: ReactorConfig) {
    ctx.strictMode && this.illegalAssignmentCheck(this, key);
    const oldValue = this.$$turboxProperties[key];
    const mergedConfig = Object.assign(
      {},
      {
        isNeedRecord: this.context.isNeedRecord,
      },
      config
    );
    this.reactorConfigMap[key] = mergedConfig;

    if (oldValue !== v) {
      this.$$turboxProperties[key] = v;
      triggerCollector.trigger(
        this,
        key,
        {
          type: ECollectType.SET,
          beforeUpdate: oldValue,
          didUpdate: v,
        },
        mergedConfig.isNeedRecord,
        {
          keyPath: [{ type: KeyPathType.property, value: key }],
          domain: this.constructor.name,
        }
      );
    }
  }

  computedPropertyGet<T>(key: string, options?: ComputedOption, descriptor?: PropertyDescriptor) {
    if (!this.computedProperties[key]) {
      this.computedProperties[key] = {
        dirty: true,
        needReComputed: false,
        needTrigger: false,
      };
    }
    const cc = this.computedProperties[key] as ComputedConfig<T>;
    const lazy = options && options.lazy !== void 0 ? options.lazy : false;
    if (!cc.reaction) {
      cc.reaction = createReaction(
        () => {
          cc.dirty = true;
          if (cc.needReComputed) {
            cc.value = cc.computeRunner!();
          }
          if (cc.needTrigger) {
            triggerCollector.trigger(
              this,
              key,
              {
                type: ECollectType.SET,
                beforeUpdate: void 0,
                didUpdate: void 0,
              },
              false
            );
          }
        },
        {
          name: key,
          computed: true,
          lazy,
        }
      );
    }

    if (!cc.computeRunner && descriptor) {
      cc.computeRunner = bind(descriptor.get, this) as () => T;
    }
    if (cc.dirty) {
      cc.needReComputed = true;
      cc.needTrigger = false;
      try {
        cc.reaction.runner();
      } finally {
        cc.dirty = false;
        cc.needReComputed = false;
        cc.needTrigger = true;
      }
    }
    depCollector.collect(this, key);

    return cc.value;
  }

  computedPropertySet<T>(key: string, original: any) {
    if (!this.computedProperties[key]) {
      this.computedProperties[key] = {
        dirty: true,
        needReComputed: false,
        needTrigger: false,
      };
    }
    const computedConfig = this.computedProperties[key] as ComputedConfig<T>;
    if (computedConfig.computeRunner) {
      return;
    }
    this.computedProperties[key].computeRunner = bind(original, this);
  }

  /**
   * the syntax sweet of updating state out of mutation
   */
  $update<K extends keyof S>(
    obj: Pick<S, K> | S,
    actionName?: string,
    displayName?: string,
    forceSaveHistory?: boolean,
    isNeedRecord?: boolean,
    immediately?: boolean
  ): void {
    invariant(isPlainObject(obj), 'resetState(...) param type error. Param should be a plain object.');
    this.dispatch(obj as object, actionName, displayName, forceSaveHistory, isNeedRecord, immediately);
  }

  private proxySet(target: any, key: string, value: any, receiver: object) {
    // array length need hack
    if (Array.isArray(target) && target !== this.currentTarget) {
      this.currentTarget = target;
      this.originalArrayLength = target[ESpecialReservedKey.ARRAY_LENGTH];
    }
    ctx.strictMode && this.illegalAssignmentCheck(target, key);
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const keyPath = keyPathCache.get(target)!;
    const rootKey = keyPath[0].value;
    // do nothing if target is in the prototype chain
    if (target === proxyCache.get(receiver)) {
      if (key === ESpecialReservedKey.ARRAY_LENGTH || value !== oldValue) {
        triggerCollector.trigger(
          target,
          key,
          {
            type: ECollectType.SET,
            beforeUpdate: key === ESpecialReservedKey.ARRAY_LENGTH ? this.originalArrayLength : oldValue,
            didUpdate: value,
          },
          this.reactorConfigMap[rootKey].isNeedRecord,
          {
            keyPath: [{ type: KeyPathType.property, value: key }],
            domain: this.constructor.name,
          }
        );
        if (key === ESpecialReservedKey.ARRAY_LENGTH) {
          this.currentTarget = void 0;
          this.originalArrayLength = void 0;
        }
      }
      if (!hadKey) {
        triggerCollector.trigger(
          target,
          key,
          {
            type: ECollectType.ADD,
            beforeUpdate: oldValue,
            didUpdate: value,
          },
          this.reactorConfigMap[rootKey].isNeedRecord,
          {
            keyPath: [{ type: KeyPathType.property, value: key }],
            domain: this.constructor.name,
          }
        );
      }
      const result = Reflect.set(target, key, value, receiver);
      return result;
    }

    return false;
  }

  private proxyGet(target: any, key: string, receiver: object) {
    const res = Reflect.get(target, key, receiver);
    const keyPath = keyPathCache.get(target)!;
    const rootKey = keyPath[0].value;

    depCollector.collect(target, key);
    if (this.reactorConfigMap[rootKey].callback) {
      const f = () => {
        meta.freeze = true;
        this.reactorConfigMap[rootKey].callback && this.reactorConfigMap[rootKey].callback.call(this, target, key);
        meta.freeze = false;
      };
      !meta.freeze && f();
    }

    return isObject(res) && !isDomain(res)
      ? this.proxyReactive(res, [
        ...keyPath,
        { type: Array.isArray(target) ? KeyPathType.index : KeyPathType.property, value: key },
      ])
      : res;
  }

  private proxyDeleteProperty(target: any, key: string) {
    const keyPath = keyPathCache.get(target)!;
    const rootKey = keyPath[0].value;
    const oldValue = target[key];
    triggerCollector.trigger(
      target,
      key,
      {
        type: ECollectType.DELETE,
        beforeUpdate: oldValue,
        didUpdate: void 0,
      },
      this.reactorConfigMap[rootKey].isNeedRecord,
      {
        keyPath: [{ type: KeyPathType.property, value: key }],
        domain: this.constructor.name,
      }
    );
    return Reflect.deleteProperty(target, key);
  }

  private proxyOwnKeys(target: any): (string | number | symbol)[] {
    depCollector.collect(target, ESpecialReservedKey.ITERATE);
    return Reflect.ownKeys(target);
  }

  /**
   * proxy value could be
   * boolean, string, number, undefined, null, custom instance, array[], plainObject{}, Map, Set, WeakMap, WeakSet
   */
  private proxyReactive(raw: object, keyPath: Array<{ type: KeyPathType; value: string }>) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    keyPathCache.set(raw, keyPath);
    // different props use same ref
    const refProxy = rawCache.get(raw);
    if (refProxy !== void 0) {
      return refProxy;
    }
    // raw is already a Proxy
    if (proxyCache.has(raw)) {
      return raw;
    }
    if (!canObserve(raw)) {
      return raw;
    }
    const proxyHandler: ProxyHandler<object> = includes(collectionTypes, raw.constructor)
      ? {
        get: bind(_this.collectionProxyHandler, _this),
      }
      : {
        get: bind(_this.proxyGet, _this),
        set: bind(_this.proxySet, _this),
        ownKeys: bind(_this.proxyOwnKeys, _this),
        deleteProperty: bind(_this.proxyDeleteProperty, _this),
      };
    const proxy = new Proxy(raw, proxyHandler);
    proxyCache.set(proxy, raw);
    rawCache.set(raw, proxy);

    return proxy;
  }

  private getCollectionHandlerMap = (target: Collection, proxyKey: string) => ({
    get size() {
      const proto = Reflect.getPrototypeOf(target) as Collection;
      depCollector.collect(target, ESpecialReservedKey.ITERATE);
      return Reflect.get(proto, proxyKey, target);
    },
    get: (key: any) => {
      const { get } = Reflect.getPrototypeOf(target) as MapType;
      depCollector.collect(target, key);
      return get.call(target, key);
    },
    has: (key: any) => {
      const { has } = Reflect.getPrototypeOf(target) as NormalCollection;
      depCollector.collect(target, key);
      return has.call(target, key);
    },
    forEach: (callbackfn: (value: any, key: any, map: Map<any, any>) => void) => {
      const { forEach } = Reflect.getPrototypeOf(target) as NormalCollection;
      depCollector.collect(target, ESpecialReservedKey.ITERATE);
      return forEach.call(target, callbackfn);
    },
    values: () => {
      const { values } = Reflect.getPrototypeOf(target) as NormalCollection;
      depCollector.collect(target, ESpecialReservedKey.ITERATE);
      return values.call(target);
    },
    keys: () => {
      const { keys } = Reflect.getPrototypeOf(target) as NormalCollection;
      depCollector.collect(target, ESpecialReservedKey.ITERATE);
      return keys.call(target);
    },
    entries: () => {
      const { entries } = Reflect.getPrototypeOf(target) as NormalCollection;
      depCollector.collect(target, ESpecialReservedKey.ITERATE);
      return entries.call(target);
    },
    [Symbol.iterator]: () => {
      if (target.constructor === Set) {
        return this.getCollectionHandlerMap(target, 'values').values();
      }
      if (target.constructor === Map) {
        return this.getCollectionHandlerMap(target, 'entries').entries();
      }
    },
    add: (value: any) => {
      const { add, has } = Reflect.getPrototypeOf(target) as SetType;
      const keyPath = keyPathCache.get(target)!;
      const rootKey = keyPath[0].value;
      const hadValue = has.call(target, value);

      if (!hadValue) {
        triggerCollector.trigger(
          target,
          value,
          {
            type: ECollectType.SET_ADD,
            beforeUpdate: void 0,
            didUpdate: value,
          },
          this.reactorConfigMap[rootKey].isNeedRecord,
          {
            keyPath,
            domain: this.constructor.name,
          }
        );

        triggerCollector.trigger(
          target,
          ESpecialReservedKey.ITERATE,
          {
            type: ECollectType.SET_ADD,
          },
          this.reactorConfigMap[rootKey].isNeedRecord
        );
      }

      return add.call(target, value);
    },
    set: (key: any, value: any) => {
      const { set, get, has } = Reflect.getPrototypeOf(target) as MapType;
      const keyPath = keyPathCache.get(target)!;
      const rootKey = keyPath[0].value;
      const hadKey = has.call(target, key);
      const oldValue = get.call(target, key);

      if (value !== oldValue) {
        triggerCollector.trigger(
          target,
          key,
          {
            type: ECollectType.MAP_SET,
            beforeUpdate: oldValue,
            didUpdate: value,
          },
          this.reactorConfigMap[rootKey].isNeedRecord,
          {
            keyPath,
            domain: this.constructor.name,
          }
        );
      }
      if (!hadKey) {
        triggerCollector.trigger(
          target,
          ESpecialReservedKey.ITERATE,
          {
            type: ECollectType.MAP_SET,
          },
          this.reactorConfigMap[rootKey].isNeedRecord
        );
      }
      return set.call(target, key, value);
    },
    delete: (key: any) => {
      const proto = Reflect.getPrototypeOf(target) as Collection;
      const keyPath = keyPathCache.get(target)!;
      const rootKey = keyPath[0].value;
      const hadKey = proto.has.call(target, key);

      if (!hadKey) {
        return proto.delete.call(target, key);
      }

      if (proto.constructor === Map || proto.constructor === WeakMap) {
        const oldValue = (proto as MapType).get.call(target, key);
        triggerCollector.trigger(
          target,
          key,
          {
            type: ECollectType.MAP_DELETE,
            beforeUpdate: oldValue,
          },
          this.reactorConfigMap[rootKey].isNeedRecord,
          {
            keyPath,
            domain: this.constructor.name,
          }
        );

        triggerCollector.trigger(
          target,
          ESpecialReservedKey.ITERATE,
          {
            type: ECollectType.MAP_DELETE,
          },
          this.reactorConfigMap[rootKey].isNeedRecord
        );
      }
      if (proto.constructor === Set || proto.constructor === WeakSet) {
        triggerCollector.trigger(
          target,
          key,
          {
            type: ECollectType.SET_DELETE,
            beforeUpdate: key,
          },
          this.reactorConfigMap[rootKey].isNeedRecord,
          {
            keyPath,
            domain: this.constructor.name,
          }
        );

        triggerCollector.trigger(
          target,
          ESpecialReservedKey.ITERATE,
          {
            type: ECollectType.SET_DELETE,
          },
          this.reactorConfigMap[rootKey].isNeedRecord
        );
      }

      return proto.delete.call(target, key);
    },
    clear: () => {
      const { clear, forEach } = Reflect.getPrototypeOf(target) as NormalCollection;
      forEach.call(target, (value: any, key: any) => {
        this.getCollectionHandlerMap(target, key).delete(key);
      });

      return clear.call(target);
    },
  });

  private collectionProxyHandler(target: Collection, key: string) {
    const handlers = this.getCollectionHandlerMap(target, key);
    const targetObj = key in target && handlers[key] ? handlers : target;
    return Reflect.get(targetObj, key);
  }

  /**
   * observed value could be assigned value to @reactor only in @mutation/$update, otherwise throw error.
   */
  private illegalAssignmentCheck(target: object, stringKey: string) {
    if (depCollector.isObserved(target, stringKey)) {
      const length = materialCallStack.stack.length;
      const firstLevelMaterial = materialCallStack.stack[length - 1] || EMaterialType.DEFAULT;
      invariant(
        firstLevelMaterial.type === EMaterialType.MUTATION ||
          firstLevelMaterial.type === EMaterialType.UPDATE ||
          firstLevelMaterial.type === EMaterialType.UNDO ||
          firstLevelMaterial.type === EMaterialType.REDO,
        "You cannot update value to observed '@reactor property' directly. Please use mutation or $update({})."
      );
    }
  }

  private dispatch(
    obj: object,
    actionName?: string,
    displayName?: string,
    forceSaveHistory?: boolean,
    isNeedRecord?: boolean,
    immediately?: boolean
  ) {
    const original = function () {
      const keys = Object.keys(obj);
      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        this[key] = obj[key];
      }
    };
    // update state before store init
    if (store === void 0) {
      original.call(this);
      materialCallStack.pop(-1);
      return;
    }
    // update state after store init
    store.dispatch({
      name: actionName || `${TURBOX_PREFIX}UPDATE`,
      displayName: displayName || EMPTY_ACTION_NAME,
      payload: [],
      type: EMaterialType.UPDATE,
      domain: this,
      original: bind(original, this) as Mutation,
      forceSaveHistory,
      isNeedRecord,
      immediately,
    });
  }
}

interface DomainConfig<R, M, C, A> {
  reactor: R;
  mutation: M;
  computed?: C;
  action?: A;
}

export function createDomain<R extends object, M extends object, C extends object = {}, A extends object = {}>(
  domainConfig: DomainConfig<R, M, C, A>
) {
  const { reactor, mutation: domainMutation, computed: domainComputed, action: domainAction } = domainConfig;
  const domain = new Domain<R>();
  const config: ReactorConfig = {
    deepProxy: true,
    displayName: '',
    isNeedRecord: true,
  };

  Object.keys(reactor).forEach(property => {
    const value = reactor[property];
    Object.defineProperty(domain, property, {
      enumerable: true,
      configurable: true,
      get() {
        const current = this as Domain;
        return current.propertyGet(property, config);
      },
      set(newVal: any) {
        const current = this as Domain;
        current.propertySet(property, newVal, config);
      },
    });
    domain[property] = value;
  });

  Object.keys(domainMutation).forEach(methodKey => {
    const original = domainMutation[methodKey];
    const f = mutation(methodKey, bind(original, domain));
    domain[methodKey] = f;
  });

  domainComputed &&
    Object.keys(domainComputed).forEach(property => {
      const original = domainComputed[property] as Pick<C, keyof C>;
      const ref = computed(bind(original, domain));
      domain[property] = ref;
    });

  domainAction &&
    Object.keys(domainAction).forEach(methodKey => {
      const original = domainAction[methodKey];
      const f = action(methodKey, bind(original, domain));
      domain[methodKey] = f;
    });

  return domain;
}
