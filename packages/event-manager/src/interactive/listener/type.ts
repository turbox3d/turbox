/** 标示拖拽阶段 */
export enum DragStatus {
  Ready = 'ready',
  Dragging = 'dragging',
  End = 'end',
}

/**
 * 当次鼠标事件（down -> move -> up）的处理类型
 */
export enum MouseDealType {
  /**
   * 作为一次 Drag 事件处理
   */
  Drag = 'drag',
  /**
   * 作为一次 Click 事件处理
   */
  Click = 'click',
  /** 多点触控事件 */
  MultiTouch = 'multi-touch',
  /** 按压 */
  Press = 'press',
}

/**
 * 可监听的交互事件类型
 */
export enum InteractiveEvent {
  Click = 1, // 涵盖移动端的 tap
  DBClick,
  RightClick,
  DragStart, // 涵盖移动端的 pan
  DragMove, // 涵盖移动端的 pan
  DragEnd, // 涵盖移动端的 pan
  Carriage,
  CarriageEnd,
  Hover,
  Wheel,
  PinchStart,
  Pinch,
  PinchEnd,
  RotateStart,
  Rotate,
  RotateEnd,
  Press,
  PressUp,
}

interface PointerEventFunc {
  (event: PointerEvent | Touch, extra?: IGesturesExtra): void;
}

interface WheelEventFunc {
  (event: WheelEvent): void;
}

export type ICallBack<E extends InteractiveEvent> = E extends InteractiveEvent.Wheel ? WheelEventFunc : PointerEventFunc;

export interface IGesturesExtra {
  scale?: number;
  deltaScale?: number;
  rotate?: number;
  deltaRotate?: number;
  eventCache?: (PointerEvent | Touch)[];
}

export interface IFunc {
  (event: PointerEvent | WheelEvent | Touch, extra?: IGesturesExtra): void;
}
