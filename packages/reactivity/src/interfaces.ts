import { Domain } from './core/domain';
import { ReactionId } from './core/collector';
import { EMaterialType } from './const/enums';
import { Action } from './core/action';

export type Dispatch = (action: DispatchedAction) => any | Promise<any>;

export type MiddlewareParam = {
  dispatch: Dispatch,
}

export interface Middleware {
  ({ dispatch }: MiddlewareParam): (next: Dispatch) => Dispatch;
}

export interface Store {
  dispatch: Dispatch;
  subscribe: (listener: Function, componentInstanceUid: ReactionId) => () => void;
}

export interface Mutation {
  (...restPayload: any[]): any | Promise<any>
}

export interface Effect {
  (action: Action, ...restPayload: any[]): Promise<void>
}

export interface DispatchedAction {
  payload: any[];
  original: Effect | Mutation;
  name: string;
  displayName: string;
  action?: Action;
  type?: EMaterialType;
  domain?: Domain;
  immediately?: boolean;
  isInner?: boolean;
}

export interface ConfigCtx {
  middleware: {
    logger?: boolean,
    effect?: boolean,
    perf?: boolean,
  },
  timeTravel: {
    isActive: boolean,
    maxStepNumber?: number,
  },
  devTool: boolean,
}

export type BabelDescriptor<T> = TypedPropertyDescriptor<T> & { initializer?: () => any }
