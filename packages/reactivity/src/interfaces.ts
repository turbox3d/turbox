import { Domain } from './core/domain';
import { ReactionId, DepNodeAssembly } from './core/collector';
import { EMaterialType } from './const/enums';
import { Action } from './core/action';
import { ActionType } from './core/store';

export interface Mutation {
  (...restPayload: any[]): any | Promise<any>;
}

// export interface Effect {
//   (action: Action, ...restPayload: any[]): Promise<void>
// }

export interface DispatchedAction {
  payload: any[];
  original: Mutation;
  name: string;
  displayName: string;
  action?: Action;
  type?: EMaterialType;
  domain?: Domain;
  immediately?: boolean;
  isInner?: boolean;
  forceSaveHistory?: boolean;
  isNeedRecord?: boolean;
}

export interface ConfigCtx {
  middleware: {
    logger?: boolean;
    diffLogger?: boolean;
    effect?: boolean;
    perf?: boolean;
    skipNestLog?: boolean;
    skipNestPerfLog?: boolean;
  };
  timeTravel: {
    isActive?: boolean;
    isNeedRecord?: boolean;
    maxStepNumber?: number;
    keepActionChain?: boolean;
  };
  disableReactive?: boolean;
  strictMode?: boolean;
  devTool?: boolean;
  batchUpdateOnFinish?: () => void;
}

export type BabelDescriptor<T> = TypedPropertyDescriptor<T> & { initializer?: () => any };

export type HistoryOperationType = 'save' | 'undo' | 'redo' | 'clear';

export type Dispatch = (action: DispatchedAction) => any | Promise<any>;

export type MiddlewareParam = {
  dispatch: Dispatch;
  getActionChain: () => ActionType[];
  getDependencyGraph: () => Map<object, DepNodeAssembly>;
};

export interface Middleware {
  ({ dispatch, getActionChain, getDependencyGraph }: MiddlewareParam): (next: Dispatch) => Dispatch;
}

export interface Store {
  dispatch: Dispatch;
  subscribe: (listener: Function, componentInstanceUid: ReactionId, idCustomType?: string) => () => void;
}
