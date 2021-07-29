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
  Drag,
  /**
   * 作为一次 Click 事件处理
   */
  Click,
}

/**
 * 可监听的交互事件类型
 */
export enum InteractiveEvent {
  Click,
  DBClick,
  RightClick,
  DragStart,
  DragMove,
  DragEnd,
  Carriage,
  CarriageEnd,
  Hover,
  Wheel,
}

interface MouseEventFunc {
  (event: MouseEvent): void;
}

interface WheelEventFunc {
  (event: WheelEvent): void;
}

export type ICallBack<E extends InteractiveEvent> = E extends InteractiveEvent.Wheel ? WheelEventFunc : MouseEventFunc;

export interface IFunc {
  (event: MouseEvent | WheelEvent): void;
}
