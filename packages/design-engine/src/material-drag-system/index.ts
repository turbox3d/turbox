/* eslint-disable @typescript-eslint/member-ordering */
import { Extra, GesturesExtra, InteractiveEvent } from '@turbox3d/event-manager';
import { Vec2 } from '@turbox3d/shared';
import { Vector2, MathUtils } from '@turbox3d/math';

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

export default class MaterialDragSystem {
  /** 入参 */
  args: any[];
  /** 事件回调处理 */
  handler: (e: InteractiveEvent, event: PointerEvent | WheelEvent | React.PointerEvent | Touch, extra?: GesturesExtra | Extra) => void;
  maxFPS = 60;

  static touchableDevice = 'ontouchstart' in window;
  /** 渲染器的 canvas 元素 */
  private canvas: HTMLCanvasElement;
  /** 当前鼠标是否处于按下状态 */
  private isMouseDown = false;
  private mouseDownInfo?: Vec2;
  /** 当前的拖拽状态 */
  private dragStatus?: DragStatus;
  /** 当次鼠标事件处理类型 */
  private mouseDealType?: MouseDealType;
  /** 坐标轴类型 */
  private coordinateType?: string;
  /** 缓存事件池，用于多点触控 */
  private eventCache: PointerEvent[] = [];
  /** 双指间距 */
  private prevDiff = new Vector2(-1, -1);
  /** 初始的间距 */
  private startDiff = new Vector2(-1, -1);
  /** 双指方向 */
  private prevVector = new Vector2();
  /** 初始的方向 */
  private startVector = new Vector2();
  private pressTimer: number;
  /** 使用 x 还是 y 轴间距作为缩放系数计算因子 */
  private useX?: boolean;

  constructor(
    handler: (e: InteractiveEvent, event: PointerEvent | WheelEvent | React.PointerEvent | Touch, extra?: GesturesExtra | Extra) => void,
    maxFPS = 60
  ) {
    this.handler = handler;
    this.maxFPS = maxFPS;
    this.registerListener();
  }

  private isMouseMoved(mouseDownInfo: Vec2, moveEvent: PointerEvent | Touch, tolerance: number) {
    const dx = mouseDownInfo.x - moveEvent.clientX;
    const dy = mouseDownInfo.y - moveEvent.clientY;
    return dx * dx + dy * dy > tolerance * tolerance;
  }

  dispose() {
    if (MaterialDragSystem.touchableDevice) {
      document.removeEventListener('touchmove', this.onTouchMove);
      document.removeEventListener('touchend', this.onTouchUp);
      document.removeEventListener('touchcancel', this.onTouchUp);
    } else {
      document.removeEventListener('pointermove', this.onMouseMove);
      document.removeEventListener('pointerup', this.onMouseUp);
      document.removeEventListener('pointercancel', this.onMouseUp);
      document.removeEventListener('pointerleave', this.onMouseUp);
    }
  }

  registerListener() {
    if (MaterialDragSystem.touchableDevice) {
      document.addEventListener('touchmove', this.onTouchMove);
      document.addEventListener('touchend', this.onTouchUp);
      document.addEventListener('touchcancel', this.onTouchUp);
    } else {
      document.addEventListener('pointermove', this.onMouseMove);
      document.addEventListener('pointerup', this.onMouseUp);
      document.addEventListener('pointercancel', this.onMouseUp);
      document.addEventListener('pointerleave', this.onMouseUp);
    }
  }

  private triggerEvent(e: InteractiveEvent, event: PointerEvent | WheelEvent | Touch, extra?: GesturesExtra | Extra) {
    this.handler(e, event, extra);
  }

  private addEventCache(event: PointerEvent) {
    this.eventCache.push(event);
  }

  private removeEventCache(event: PointerEvent) {
    for (let i = 0; i < this.eventCache.length; i++) {
      if (this.eventCache[i].pointerId === event.pointerId) {
        this.eventCache.splice(i, 1);
        break;
      }
    }
  }

  private updateEventCache(event: PointerEvent) {
    for (let i = 0; i < this.eventCache.length; i++) {
      if (event.pointerId === this.eventCache[i].pointerId) {
        this.eventCache[i] = event;
        break;
      }
    }
  }

  private downHandler = <E extends PointerEvent | Touch>(eventList: E[]) => {
    this.isMouseDown = true;
    if (eventList.length === 1) {
      this.mouseDealType = MouseDealType.Click;
      this.dragStatus = DragStatus.Ready;
      this.mouseDownInfo = { x: eventList[0].clientX, y: eventList[0].clientY };
      this.pressTimer = window.setTimeout(() => {
        this.mouseDealType = MouseDealType.Press;
        this.triggerEvent(InteractiveEvent.Press, eventList[0]);
      }, 250);
    } else if (eventList.length === 2) {
      // 双指操作，rotate or pinch
      window.clearTimeout(this.pressTimer);
      this.startDiff = new Vector2(
        Math.abs(eventList[0].clientX - eventList[1].clientX),
        Math.abs(eventList[0].clientY - eventList[1].clientY)
      );
      this.startVector = new Vector2(
        eventList[1].clientX - eventList[0].clientX,
        eventList[1].clientY - eventList[0].clientY
      );
      this.mouseDealType = MouseDealType.MultiTouch;
    }
  };

  onMouseDown = (...args: any[]) => (event: PointerEvent) => {
    event.preventDefault();
    this.args = args;
    this.addEventCache(event);
    this.downHandler(this.eventCache);
  };

  onTouchDown = (...args: any[]) => (event: TouchEvent) => {
    event.preventDefault();
    this.args = args;
    this.isMouseDown = true;
    this.downHandler(Array.from(event.targetTouches || event.touches));
  };

  private moveHandler = <E extends PointerEvent | Touch>(event: E, eventList: E[]) => {
    if (this.mouseDealType === MouseDealType.MultiTouch) {
      if (eventList.length === 2) {
        const curDiff = new Vector2(
          Math.abs(eventList[0].clientX - eventList[1].clientX),
          Math.abs(eventList[0].clientY - eventList[1].clientY)
        );
        this.useX === undefined && (this.useX = curDiff.x > curDiff.y);
        const curVector = new Vector2(
          eventList[1].clientX - eventList[0].clientX,
          eventList[1].clientY - eventList[0].clientY
        );
        if (this.prevDiff.x > 0 && this.prevDiff.y > 0) {
          this.triggerEvent(InteractiveEvent.Pinch, event, {
            scale: this.useX ? curDiff.x / this.startDiff.x : curDiff.y / this.startDiff.y,
            deltaScale: this.useX ? curDiff.x / this.prevDiff.x : curDiff.y / this.prevDiff.y,
            eventCache: eventList,
          });
        } else {
          this.triggerEvent(InteractiveEvent.PinchStart, event, {
            eventCache: eventList,
          });
        }
        if (this.prevVector.x === 0 && this.prevVector.y === 0) {
          this.triggerEvent(InteractiveEvent.RotateStart, event, {
            eventCache: eventList,
          });
        } else {
          const degree = curVector.angleTo(this.startVector) * MathUtils.RAD2DEG;
          const deltaDegree = curVector.angleTo(this.prevVector) * MathUtils.RAD2DEG;
          this.triggerEvent(InteractiveEvent.Rotate, event, {
            rotate: degree,
            deltaRotate: deltaDegree,
            eventCache: eventList,
          });
        }
        this.prevDiff = curDiff;
        this.prevVector = curVector;
      }
    } else if (
      this.mouseDealType === MouseDealType.Drag ||
      (this.mouseDownInfo && this.isMouseMoved(this.mouseDownInfo, event, 4))
    ) {
      window.clearTimeout(this.pressTimer);
      this.mouseDealType = MouseDealType.Drag;
      if (this.dragStatus === DragStatus.Ready) {
        this.dragStatus = DragStatus.Dragging;
        this.triggerEvent(InteractiveEvent.DragStart, event, {
          mouseDownInfo: {
            x: this.mouseDownInfo?.x || 0,
            y: this.mouseDownInfo?.y || 0,
          },
        });
      } else if (this.dragStatus === DragStatus.Dragging) {
        this.triggerEvent(InteractiveEvent.DragMove, event);
      }
    }
  };

  private onMouseMove = (event: PointerEvent) => {
    event.preventDefault();
    if (this.isMouseDown) {
      if (this.mouseDealType === MouseDealType.MultiTouch) {
        this.updateEventCache(event);
      }
      this.moveHandler(event, this.eventCache);
    } else {
      this.triggerEvent(InteractiveEvent.Hover, event);
      this.triggerEvent(InteractiveEvent.Carriage, event);
    }
  };

  private onTouchMove = (event: TouchEvent) => {
    const eventArr = Array.from(event.targetTouches || event.touches);
    if (!eventArr.length) {
      return;
    }
    if (this.isMouseDown) {
      // 多点触控下，当前用于识别的事件先默认取第一个
      if (eventArr[0].target === this.canvas) {
        event.preventDefault();
      }
      this.moveHandler(eventArr[0], eventArr);
    }
  };

  private upHandler = <E extends PointerEvent | Touch>(event: E, eventList: E[]) => {
    this.useX = undefined;
    if (eventList.length === 0) {
      this.isMouseDown = false;
      window.clearTimeout(this.pressTimer);
      if (this.mouseDealType === MouseDealType.Drag) {
        this.triggerEvent(InteractiveEvent.DragEnd, event);
      } else if (this.mouseDealType === MouseDealType.Click) {
        if (MaterialDragSystem.touchableDevice) {
          this.triggerEvent(InteractiveEvent.Click, event);
        } else {
          const tempEvent = event as PointerEvent;
          if (tempEvent.button === 0) {
            this.triggerEvent(InteractiveEvent.Click, event);
          } else if (tempEvent.button === 2) {
            this.triggerEvent(InteractiveEvent.RightClick, event);
          }
        }
      } else if (this.mouseDealType === MouseDealType.MultiTouch) {
        this.triggerEvent(InteractiveEvent.PinchEnd, event, {
          eventCache: eventList,
        });
        this.triggerEvent(InteractiveEvent.RotateEnd, event, {
          eventCache: eventList,
        });
      } else if (this.mouseDealType === MouseDealType.Press) {
        this.triggerEvent(InteractiveEvent.PressUp, event);
      }
      this.triggerEvent(InteractiveEvent.CarriageEnd, event);
      this.mouseDealType = undefined;
      this.dragStatus = undefined;
      this.mouseDownInfo = undefined;
      this.args = [];
    } else if (this.mouseDealType === MouseDealType.MultiTouch) {
      if (eventList.length < 2) {
        this.prevDiff = new Vector2(-1, -1);
        this.startDiff = new Vector2(-1, -1);
        this.prevVector = new Vector2();
        this.startVector = new Vector2();
      }
    }
  };

  private onMouseUp = (event: PointerEvent) => {
    event.preventDefault();
    this.removeEventCache(event);
    this.upHandler(event, this.eventCache);
  };

  private onTouchUp = (event: TouchEvent) => {
    const eventArr = Array.from(event.targetTouches || event.touches);
    // 多点触控下，当前用于识别的事件先默认取第一个
    if (event.changedTouches[0].target === this.canvas) {
      event.preventDefault();
    }
    this.upHandler(event.changedTouches[0], eventArr);
  };
}
