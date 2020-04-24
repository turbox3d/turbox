/**
 * Check if a string starts with $ or _
 */
export function isReserved(str: string): boolean {
  const c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}

export function isSupportProxy(): boolean {
  return typeof Proxy !== 'undefined';
}

export function isSymbol(symbol: any): boolean {
  return typeof symbol === 'symbol';
}

export function isSupportSymbol(): boolean {
  return typeof Symbol !== 'undefined';
}

export const toObjectTypeString = (value: any): string => Object.prototype.toString.call(value);

export const stateDecoRegExp = /^\[object (?:Object|Array)\]$/;
