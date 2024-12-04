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
  GIZMO = 9999,
}
