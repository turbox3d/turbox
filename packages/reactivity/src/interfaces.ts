import { Domain } from './core/domain';
import { ReactionId, DepNodeAssembly } from './core/collector';
import { EMaterialType } from './const/enums';
import { Action } from './core/action';
import { ActionType } from './core/store';

export type Dispatch = (action: DispatchedAction) => any | Promise<any>;

export type MiddlewareParam = {
  dispatch: Dispatch,
  getActionChain: () => ActionType[],
  getDependencyGraph: () => Map<object, DepNodeAssembly>,
}

export interface Middleware {
  ({ dispatch, getActionChain, getDependencyGraph }: MiddlewareParam): (next: Dispatch) => Dispatch;
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
    diffLogger?: boolean,
    effect?: boolean,
    perf?: boolean,
    skipNestLog?: boolean,
    skipNestPerfLog?: boolean,
  },
  timeTravel: {
    isActive?: boolean,
    maxStepNumber?: number,
    keepActionChain?: boolean,
  },
  strictMode?: boolean,
  devTool?: boolean,
}

export type BabelDescriptor<T> = TypedPropertyDescriptor<T> & { initializer?: () => any }
