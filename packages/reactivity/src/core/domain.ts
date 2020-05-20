import { CURRENT_MATERIAL_TYPE, NAMESPACE } from '../const/symbol';
import { EMaterialType, Mutation } from '../interfaces';
import { isPlainObject, convert2UniqueString, hasOwn, isObject, bind, isDomain } from '../utils/common';
import { invariant } from '../utils/error';
import generateUUID from '../utils/uuid';
import { depCollector, triggerCollector } from './collector';
import { canObserve } from '../utils/decorator';
import { store } from './store';
import { ReactorConfig } from '../decorators/reactor';
import { EOperationTypes } from './time-travel';

const proxyCache = new WeakMap<any, any>();
const rawCache = new WeakMap<any, any>();
const rootKeyCache = new WeakMap<any, string>();
export const materialCallStack: EMaterialType[] = [];

/**
 * Framework base class 'Domain', class must be extends this base class which is need to be observable.
 */
export class Domain<S = {}> {
  // prompt: add property do not forget sync to black list
  public properties: { [key in keyof this]?: this[key] } = {};
  private reactorConfigMap: { [key in keyof this]?: ReactorConfig } = {};

  constructor() {
    const target = Object.getPrototypeOf(this);
    const domainName = target.constructor.name || 'TURBOX_DOMAIN';
    const namespace = `${domainName}_${generateUUID()}`;
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.DEFAULT;
    this[NAMESPACE] = namespace;
  }

  propertyGet(key: string | symbol | number, config: ReactorConfig) {
    const stringKey = convert2UniqueString(key);
    const v = this.properties[stringKey];
    this.reactorConfigMap[stringKey] = config;

    depCollector.collect(this, stringKey);

    return isObject(v) && !isDomain(v) && config.deepProxy ? this.proxyReactive(v, stringKey) : v;
  }

  propertySet(key: string | symbol | number, v: any, config: ReactorConfig) {
    const stringKey = convert2UniqueString(key);
    this.illegalAssignmentCheck(this, stringKey);
    const oldValue = this.properties[stringKey];
    this.reactorConfigMap[stringKey] = config;

    if (oldValue !== v) {
      this.properties[stringKey] = v;
      triggerCollector.trigger(this, stringKey, {
        type: EOperationTypes.SET,
        beforeUpdate: oldValue,
        didUpdate: v,
      }, config.isNeedRecord);
    }
  }

  private proxySet(target: any, key: string | symbol | number, value: any, receiver: any) {
    const stringKey = convert2UniqueString(key);
    this.illegalAssignmentCheck(target, stringKey);
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const rootKey = rootKeyCache.get(target)!;
    // do nothing if target is in the prototype chain
    if (target === proxyCache.get(receiver)) {
      const result = Reflect.set(target, key, value, receiver);
      if (!hadKey) {
        triggerCollector.trigger(target, stringKey, {
          type: EOperationTypes.ADD,
          beforeUpdate: oldValue,
          didUpdate: value,
        }, this.reactorConfigMap[rootKey].isNeedRecord);
      } else if (value !== oldValue) {
        triggerCollector.trigger(target, stringKey, {
          type: EOperationTypes.SET,
          beforeUpdate: oldValue,
          didUpdate: value,
        }, this.reactorConfigMap[rootKey].isNeedRecord);
      }
      return result;
    }

    return false;
  }

  private proxyGet(target: any, key: string | symbol | number, receiver: any) {
    const res = Reflect.get(target, key, receiver);
    const stringKey = convert2UniqueString(key);
    const rootKey = rootKeyCache.get(target)!;

    depCollector.collect(target, stringKey);
    if (this.reactorConfigMap[rootKey].callback) {
      this.reactorConfigMap[rootKey].callback.call(this, target, key);
    }

    return isObject(res) && !isDomain(res) ? this.proxyReactive(res, rootKey) : res;
  }

  private proxyOwnKeys(target: any): (string | number | symbol)[] {
    depCollector.collect(target, EOperationTypes.ITERATE);
    return Reflect.ownKeys(target);
  }

  /**
   * proxy value could be boolean, string, number, undefined, null, custom instance, array[], plainObject{}
   * @todo: support Map、Set、WeakMap、WeakSet
   */
  private proxyReactive(raw: object, rootKey: string) {
    const _this = this;
    rootKeyCache.set(raw, rootKey);
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
    const proxy = new Proxy(raw, {
      get: bind(_this.proxyGet, _this),
      set: bind(_this.proxySet, _this),
      ownKeys: bind(_this.proxyOwnKeys, _this),
    });
    proxyCache.set(proxy, raw);
    rawCache.set(raw, proxy);

    return proxy;
  }

  /**
   * the syntax sweet of updating state out of mutation
   */
  $update<K extends keyof S>(obj: Pick<S, K> | S, actionName?: string): void {
    invariant(isPlainObject(obj), 'resetState(...) param type error. Param should be a plain object.');
    this.dispatch(obj as object, actionName);
  }

  /**
   * observed value could be assigned value to @reactor only in @mutation/$update, otherwise throw error.
   */
  private illegalAssignmentCheck(target: object, stringKey: string) {
    if (depCollector.isObserved(target, stringKey)) {
      const length = materialCallStack.length;
      const firstLevelMaterial = materialCallStack[length - 1] || EMaterialType.DEFAULT;
      invariant(
        firstLevelMaterial === EMaterialType.MUTATION ||
        firstLevelMaterial === EMaterialType.UPDATE ||
        firstLevelMaterial === EMaterialType.TIME_TRAVEL,
        'You cannot update value to observed \'@reactor property\' directly. Please use mutation or $update({}).'
      );
    }
  }

  private dispatch(obj: object, actionName?: string) {
    const original = function () {
      const keys = Object.keys(obj);
      for (let i = 0, len = keys.length; i < len; i++) {
        const key = keys[i];
        this[key] = obj[key];
      }
    };
    this[CURRENT_MATERIAL_TYPE] = EMaterialType.UPDATE;
    materialCallStack.push(this[CURRENT_MATERIAL_TYPE]);
    // update state before store init
    if (store === void 0) {
      original.call(this);
      materialCallStack.pop();
      const length = materialCallStack.length;
      this[CURRENT_MATERIAL_TYPE] = materialCallStack[length - 1] || EMaterialType.DEFAULT;
      return;
    }
    // update state after store init
    store.dispatch({
      name: actionName || `@@TURBOX__UPDATE_${generateUUID()}`,
      payload: [],
      type: EMaterialType.UPDATE,
      domain: this,
      original: bind(original, this) as Mutation
    });
    materialCallStack.pop();
    const length = materialCallStack.length;
    this[CURRENT_MATERIAL_TYPE] = materialCallStack[length - 1] || EMaterialType.DEFAULT;
  }
}
