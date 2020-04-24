import { Domain } from './core/domain';
import { Component } from 'react';

export type MiddlewareParam = {
  dispatch: (action: DispatchedAction) => DispatchedAction,
}

export interface Middleware {
  ({ dispatch }: MiddlewareParam): (next: any) => (action: DispatchedAction) => any
}

export interface Store {
  dispatch: (action: DispatchedAction) => DispatchedAction | Promise<DispatchedAction>,
  subscribe: (listener: Function, componentInstanceUid: Component) => () => void,
}

export interface AtomStateTree {
  instance: Domain<any>,
  plainObject: ModuleState,
  default: ModuleState
}

export interface ModuleState {
  [key: string]: any
}

export interface Mutation {
  (...restPayload: any[]): void
}

export interface Effect {
  (...restPayload: any[]): Promise<void>
}

export enum EMaterialType {
  DEFAULT = 1,
  MUTATION,
  UPDATE,
  EFFECT,
  TIME_TRAVEL,
}

export interface DispatchedAction {
  payload: any[],
  original: Effect | Mutation,
  name?: string,
  type?: EMaterialType,
  domain?: Domain,
  isAtom?: boolean;
  isInner?: boolean;
}

export interface ConfigCtx {
  middleware: {
    logger: boolean,
    effect: boolean
  },
  timeTravel: {
    isActive: boolean,
    maxStepNumber: number,
  },
  devTool: boolean,
}

export type BabelDescriptor<T> = TypedPropertyDescriptor<T> & { initializer?: () => any }
