export enum Z_INDEX_ACTION {
  /** 置顶 */
  TOP = 'top',
  /** 置底 */
  BOTTOM = 'bottom',
  /** 下移 */
  DECREASE = 'decrease',
  /** 上移 */
  INCREASE = 'increase',
}

export enum RenderOrder {
  GRID = -9999,
  BACKGROUND = -1,
  SNAP_LINE = 9000,
  GIZMO = 9999,
}

export enum ItemType {
  /** 图片 */
  IMAGE = 'image',
  /** 文本 */
  TEXT = 'text',
  /** 按钮 */
  BUTTON = 'button',
}
