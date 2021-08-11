import { SceneMouseEvent } from './sceneMouse';

export enum CoordinateType {
  /** 屏幕到画布 */
  ScreenToCanvas,
  /** 屏幕到场景 */
  ScreenToScene,
  /** 画布到场景 */
  CanvasToScene,
  /** 画布到屏幕 */
  CanvasToScreen,
  /** 场景到屏幕 */
  SceneToScreen,
  /** 场景到画布 */
  SceneToCanvas,
}

export interface IViewEntity {
  id: string;
  type: symbol;
}

export interface InteractiveConfig {
  // 交互状态
  isClickable: boolean;
  isDraggable: boolean;
  isHoverable: boolean;
  // 交互回调
  onClick: (event: SceneMouseEvent) => void;
  onDBClick: (event: SceneMouseEvent) => void;
  onRightClick: (event: SceneMouseEvent) => void;
  dragStart: (event: SceneMouseEvent) => void;
  dragMove: (event: SceneMouseEvent) => void;
  dragEnd: (event: SceneMouseEvent) => void;
  onHoverIn: (event: SceneMouseEvent) => void;
  onHoverOut: (event: SceneMouseEvent) => void;
  // 关联的 viewEntity
  getViewEntity?: () => IViewEntity;
}

export interface CanvasHandlers {
  /** 没点击到任何目标时的回调 */
  onClick: (event: SceneMouseEvent) => void;
  onRightClick: (event: SceneMouseEvent) => void;
  onDragStart: (event: SceneMouseEvent) => void;
  onDragMove: (event: SceneMouseEvent) => void;
  onDragEnd: (event: SceneMouseEvent) => void;
  onMouseMove: (event: SceneMouseEvent) => void;
  onMouseUp: (event: SceneMouseEvent) => void;
  onWheel: (event: WheelEvent) => void;
}

export type InteractiveType = 'isClickable' | 'isDraggable' | 'isHoverable';

export interface IViewportInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  resolution?: number;
}
