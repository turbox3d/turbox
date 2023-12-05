export interface IConstructorOf<T> {
  new(...args: any[]): T;
}

export interface IMapOf<T> {
  [key: string]: T;
}

export type Nullable<T> = { [K in keyof T]?: T[K] | null };

export function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

export interface IDictionary<T> {
  [index: string]: T;
}

export interface INumericDictionary<T> {
  [index: number]: T;
}
