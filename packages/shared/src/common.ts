import { isSymbol } from './lang';
import { generateUUID } from './uuid';

export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object';
}

export function isPromise(value: any) {
  return value && typeof value.then === 'function';
}

// {}
export function isPlainObject(value: any) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * 对数组从小到大排序
 */
export function sortBy<T>(arr: T[], func?: (item: T) => number) {
  const length = arr.length;

  for (let i = 0; i < length; i++) {
    for (let j = i + 1; j < length; j++) {
      const itemI = arr[i];
      const itemJ = arr[j];
      const indicatorI = func ? func(itemI) : itemI;
      const indicatorJ = func ? func(itemJ) : itemJ;
      if (indicatorJ < indicatorI) {
        arr[i] = itemJ;
        arr[j] = itemI;
      }
    }
  }

  return arr;
}

export function includes<T>(array: T[], item: T) {
  return array.indexOf(item) > -1;
}

export function remove<T>(array: T[], item: T) {
  const index = array.indexOf(item);
  if (index > -1) {
    array.splice(index, 1);
  }
}

export function batchRemove<T>(array: T[], items: T[]) {
  items.forEach((item) => {
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }
  });
}

export function batchRemoveFromSet<T>(set: Set<T>, items: T[]) {
  items.forEach((item) => {
    set.delete(item);
  });
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

export const deduplicate = <T>(array: T[]): T[] => Array.from(new Set(array));

const promise = Promise.resolve();
/**
 * nextTick would flush promise micro task
 */
export function nextTick(fn?: () => void): Promise<void> {
  return fn ? promise.then(fn) : promise;
}

export const hasOwn = (
  val: object,
  key: string | symbol | number,
): key is keyof typeof val => Object.prototype.hasOwnProperty.call(val, key);

// From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
export function is(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  }
  // eslint-disable-next-line no-self-compare
  return x !== x && y !== y;
}

export function bind(fn, ctx) {
  function boundFn(a?: any) {
    const l: number = arguments.length;
    // eslint-disable-next-line no-nested-ternary
    return l
      ? l > 1
        // eslint-disable-next-line prefer-rest-params
        ? fn.apply(ctx, arguments)
        : fn.call(ctx, a)
      : fn.call(ctx);
  }
  return boundFn;
}

// From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
export function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true;
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    if (!objB.hasOwnProperty(keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }
  return true;
}

export const dummy = () => {
  //
};

export function loadJSON(url: string): Promise<any> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType('application/json');
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText || '{}'));
      }
    };
    xhr.send(null);
  });
}

export function updateQueryStringParameter(url: string, key: string, value: string) {
  if (!value) {
    return url;
  }
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const separator = url.indexOf('?') !== -1 ? '&' : '?';
  if (url.match(re)) {
    return url.replace(re, `$1${key}=${value}$2`);
  }
  return `${url}${separator}${key}=${value}`;
}
