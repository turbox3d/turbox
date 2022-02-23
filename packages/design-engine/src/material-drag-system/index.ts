/* eslint-disable @typescript-eslint/member-ordering */
import { InteractiveEvent } from '@turbox3d/event-manager';
import { Vec2, throttleInAFrame, TaskPriority } from '@turbox3d/shared';

enum MouseDealType {
  Drag,
  Click,
}

enum DragStatus {
  Ready = 'ready',
  Dragging = 'dragging',
  End = 'end',
}

export default class MaterialDragSystem {
  private isMouseDown: boolean;
  private mouseDownInfo: Vec2;
  private mouseDealType: MouseDealType;
  private dragStatus: DragStatus;
  /** 入参 */
  args: any[];
  /** 事件回调处理 */
  handler: (e: InteractiveEvent, event: PointerEvent | WheelEvent | React.PointerEvent | Touch) => void;
  maxFPS = 60;

  constructor(handler: (e: InteractiveEvent, event: PointerEvent | WheelEvent | React.PointerEvent | Touch) => void, maxFPS = 60) {
    this.handler = handler;
    this.maxFPS = maxFPS;
    document.addEventListener('pointermove', this.onMouseMove);
  }

  private onMouseUp = (event: PointerEvent) => {
    this.isMouseDown = false;
    if (this.mouseDealType === MouseDealType.Drag) {
      this.triggerEvent(InteractiveEvent.DragEnd, event);
    } else if (this.mouseDealType === MouseDealType.Click) {
      if (event.button === 0) {
        this.triggerEvent(InteractiveEvent.Click, event);
      } else if (event.button === 2) {
        this.triggerEvent(InteractiveEvent.RightClick, event);
      }
    }
    this.triggerEvent(InteractiveEvent.CarriageEnd, event);
    document.removeEventListener('pointerup', this.onMouseUp);
    this.args = [];
  };

  /**
   * 指针按下的事件
   * @param args 参数列表
   */
  onMouseDown = (...args: any[]) => (event: React.PointerEvent<Element>) => {
    event.persist();
    this.args = args;
    this.isMouseDown = true;
    this.mouseDealType = MouseDealType.Click;
    this.dragStatus = DragStatus.Ready;
    this.mouseDownInfo = { x: event.clientX, y: event.clientY };
    document.addEventListener('pointerup', this.onMouseUp);
  };

  private isMouseMoved(moveEvent: PointerEvent, tolerance: number) {
    const dx = this.mouseDownInfo.x - moveEvent.clientX;
    const dy = this.mouseDownInfo.y - moveEvent.clientY;
    return dx * dx + dy * dy > tolerance * tolerance;
  }

  private triggerEvent(e: InteractiveEvent, event: PointerEvent | WheelEvent | React.PointerEvent | Touch) {
    this.handler(e, event);
  }

  private onMouseMove = throttleInAFrame((event: PointerEvent) => {
    if (this.isMouseDown) {
      // 鼠标按下状态
      if (this.mouseDealType === MouseDealType.Drag || this.isMouseMoved(event, 4)) {
        this.mouseDealType = MouseDealType.Drag;
        if (this.dragStatus === DragStatus.Ready) {
          this.dragStatus = DragStatus.Dragging;
          this.triggerEvent(InteractiveEvent.DragStart, event);
        } else if (this.dragStatus === DragStatus.Dragging) {
          this.triggerEvent(InteractiveEvent.DragMove, event);
        }
      }
    } else {
      this.triggerEvent(InteractiveEvent.Hover, event);
      this.triggerEvent(InteractiveEvent.Carriage, event);
    }
  }, TaskPriority.UserAction, this.maxFPS);

  /**
   * 销毁
   */
  dispose() {
    document.removeEventListener('pointermove', this.onMouseMove);
  }
}
