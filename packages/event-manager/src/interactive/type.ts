import { SceneEvent } from './sceneEvent';

export enum CoordinateType {
  /** 屏幕到画布 */
  ScreenToCanvas = 1,
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

export interface ViewEntity {
  id: string;
  type: symbol;
  [propKey: string]: any;
}

export interface InteractiveConfig {
  // 交互状态
  isClickable: boolean;
  isDraggable: boolean;
  isHoverable: boolean;
  isPinchable: boolean;
  isRotatable: boolean;
  isPressable: boolean;
  // 交互回调
  onClick: (event: SceneEvent) => void;
  onDBClick: (event: SceneEvent) => void;
  onRightClick: (event: SceneEvent) => void;
  onDragStart: (event: SceneEvent) => void;
  onDragMove: (event: SceneEvent) => void;
  onDragEnd: (event: SceneEvent) => void;
  onPinchStart: (event: SceneEvent) => void;
  onPinch: (event: SceneEvent) => void;
  onPinchEnd: (event: SceneEvent) => void;
  onRotateStart: (event: SceneEvent) => void;
  onRotate: (event: SceneEvent) => void;
  onRotateEnd: (event: SceneEvent) => void;
  onPress: (event: SceneEvent) => void;
  onPressUp: (event: SceneEvent) => void;
  onHoverIn: (event: SceneEvent) => void;
  onHoverOut: (event: SceneEvent) => void;
  // 关联的 viewEntity
  getViewEntity: () => Partial<ViewEntity>;
}

export interface CanvasHandlers {
  /** 没点击到任何目标时的回调 */
  onClick: (event: SceneEvent) => void;
  onDBClick: (event: SceneEvent) => void;
  onRightClick: (event: SceneEvent) => void;
  onDragStart: (event: SceneEvent) => void;
  onDragMove: (event: SceneEvent) => void;
  onDragEnd: (event: SceneEvent) => void;
  onPinchStart: (event: SceneEvent) => void;
  onPinch: (event: SceneEvent) => void;
  onPinchEnd: (event: SceneEvent) => void;
  onRotateStart: (event: SceneEvent) => void;
  onRotate: (event: SceneEvent) => void;
  onRotateEnd: (event: SceneEvent) => void;
  onPress: (event: SceneEvent) => void;
  onPressUp: (event: SceneEvent) => void;
  onPointerMove: (event: SceneEvent) => void;
  onPointerUp: (event: SceneEvent) => void;
  onWheel: (event: SceneEvent) => void;
}

export type InteractiveType = 'isClickable' | 'isDraggable' | 'isHoverable' | 'isPinchable' | 'isRotatable' | 'isPressable';

export interface ViewportInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  resolution?: number;
}

interface ICustomEvent {
  clientX: number;
  clientY: number;
  [key: string]: any;
}

// 原生事件集合
export type NativeEventSet = PointerEvent | WheelEvent | Touch | ICustomEvent;
