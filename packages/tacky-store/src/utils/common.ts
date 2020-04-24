import { isSymbol } from './lang';
import generateUUID from './uuid';
import { Domain } from '../core/domain';

export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object';
}

export function isDomain(value: any): boolean {
  return value instanceof Domain;
}

// {}
export function isPlainObject(value: any) {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export function includes<T>(array: T[], item: T) {
  return array.indexOf(item) > -1;
}

// boolean, string, number, undefined, null
export function isPrimitive(value: any) {
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
}

export function convert2UniqueString(key: string | symbol | number) {
  if (!isSymbol(key)) {
    return (key as string | number).toString();
  }
  return (key as symbol).toString() + generateUUID();
}

export const deduplicate = (array: any[]): any[] => Array.from(new Set(array));

const promise = Promise.resolve();
/**
 * nextTick would flush promise micro task
 */
export function nextTick(fn?: () => void): Promise<void> {
  return fn ? promise.then(fn) : promise;
}

export const hasOwn = (
  val: object,
  key: string | symbol | number
): key is keyof typeof val => Object.prototype.hasOwnProperty.call(val, key);

// From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
export function is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y
  } else {
    return x !== x && y !== y
  }
}

export function bind(fn, ctx) {
  function boundFn(a?: any) {
    const l: number = arguments.length
    return l
      ? l > 1
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx)
  }
  return boundFn
}

// From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
export function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }
  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)
  if (keysA.length !== keysB.length) return false
  for (let i = 0; i < keysA.length; i++) {
    if (!objB.hasOwnProperty(keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }
  return true
}
