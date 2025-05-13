export const IdCustomType = 'renderer';

export enum NodeStatus {
  READY = 1,
  UPDATE = 2,
  UPDATE_INTERACTIVE = 4,
  UPDATE_CUSTOM_PROPS = 8,
  FAKE_UPDATE = 16,
  REMOVE = 32,
  CREATE = 64,
}

export enum NodeTag {
  COMPONENT = 1,
  SCENE = 2,
  MESH = 3,
}
