export const IdCustomType = 'renderer';

export enum NodeStatus {
  READY = 1,
  UPDATE = 2,
  FAKE_UPDATE = 4,
  REMOVE = 8,
  CREATE = 16,
}

export enum NodeTag {
  COMPONENT = 1,
  SCENE = 2,
  MESH = 3,
}
