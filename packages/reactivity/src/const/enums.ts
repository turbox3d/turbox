export enum EDepState {
  NOT_OBSERVED = 'notObserved',
  OBSERVED = 'observed',
  LATEST = 'latest',
}

export enum ESpecialReservedKey {
  ARRAY_LENGTH = 'length',
  ITERATE = 'iterate',
  COMPUTED = 'computed',
}

export const enum ECollectType {
  SET = 'set',
  ADD = 'add',
  DELETE = 'delete',
}

export enum EMaterialType {
  DEFAULT = 'default',
  MUTATION = 'mutation',
  UPDATE = 'update',
  EFFECT = 'effect',
  TIME_TRAVEL = 'timeTravel',
}
