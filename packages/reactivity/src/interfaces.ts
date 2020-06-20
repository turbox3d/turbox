import { Domain } from './core/domain';
import { ReactionId } from './core/collector';
import { EMaterialType } from './const/enums';

export type MiddlewareParam = {
  dispatch: (action: DispatchedAction) => DispatchedAction,
}

export interface Middleware {
  ({ dispatch }: MiddlewareParam): (next: any) => (action: DispatchedAction) => any
}

export interface Store {
  dispatch: (action: DispatchedAction) => DispatchedAction | Promise<DispatchedAction>,
  subscribe: (listener: Function, componentInstanceUid: ReactionId) => () => void,
}

export interface Mutation {
  (...restPayload: any[]): void
}

export interface Effect {
  (...restPayload: any[]): Promise<void>
}

export interface DispatchedAction {
  payload: any[];
  original: Effect | Mutation;
  name: string;
  displayName: string;
  type?: EMaterialType;
  domain?: Domain;
  isAtom?: boolean;
  isInner?: boolean;
}

export interface ConfigCtx {
  middleware: {
    logger?: boolean,
  },
  timeTravel: {
    isActive: boolean,
    maxStepNumber?: number,
  },
  devTool: boolean,
}

export type BabelDescriptor<T> = TypedPropertyDescriptor<T> & { initializer?: () => any }
