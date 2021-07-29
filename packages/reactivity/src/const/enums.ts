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
  MAP_SET = 'map-set',
  ADD = 'add',
  SET_ADD = 'set-add',
  DELETE = 'delete',
  MAP_DELETE = 'map-delete',
  SET_DELETE = 'set-delete',
}

export enum EMaterialType {
  DEFAULT = 'default',
  MUTATION = 'mutation',
  ACTION = 'action',
  UPDATE = 'update',
  EFFECT = 'effect',
  UNDO = 'undo',
  REDO = 'redo',
}

export enum ActionStatus {
  WORKING = 'working',
  COMPLETED = 'completed',
  ABORT = 'abort',
}
