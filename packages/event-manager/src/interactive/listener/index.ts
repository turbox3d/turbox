import { getRelativePositionFromEvent, pointInRect, Vec2 } from '@turbox3d/shared';
import { Vector2, MathUtils } from '@turbox3d/math';
import { DragStatus, ICallBack, IFunc, InteractiveEvent, MouseDealType, IGesturesExtra, IExtra } from './type';
import { isMouseMoved } from './utils';
import { IViewportInfo } from '../type';

/**
 * 场景鼠标交互事件转化器
 * 将目标画布上的鼠标事件转化为场景之间，诸如：onClick, onDrag, onCarriage, onHover ...
 */
export class InteractiveListener {
  static moveTolerance = 4;
  static touchableDevice = 'ontouchstart' in window;
  static create(canvas: HTMLCanvasElement, viewport?: IViewportInfo, coordinateType?: string) {
    return new InteractiveListener(canvas, viewport, coordinateType);
  }
  private listeners: Map<InteractiveEvent, IFunc[]> = new Map();
  /** 渲染器的 canvas 元素 */
  private canvas: HTMLCanvasElement;
  /** 当前鼠标是否处于按下状态 */
  private isMouseDown = false;
  private mouseDownInfo?: Vec2;
  /** 当前的拖拽状态 */
  private dragStatus?: DragStatus;
  /** 当次鼠标事件处理类型 */
  private mouseDealType?: MouseDealType;
  /** 视口信息 */
  private viewport?: IViewportInfo;
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

  constructor(canvas: HTMLCanvasElement, viewport?: IViewportInfo, coordinateType?: string) {
    this.canvas = canvas;
    this.viewport = viewport;
    this.coordinateType = coordinateType;
  }

  updateViewportInfo = (viewport: IViewportInfo) => {
    this.viewport = viewport;
  };

  addEventListener<E extends InteractiveEvent>(event: E, func: ICallBack<E>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const handlers = this.listeners.get(event)!;
    handlers.push(func);
    return this;
  }

  removeEventListener<E extends InteractiveEvent>(event: E, func?: ICallBack<E>) {
    if (this.listeners.has(event)) {
      if (!func) {
        // 停止监听当前事件
        this.listeners.delete(event);
        return this;
      }

      const handlers = this.listeners.get(event)!;
      const index = handlers.indexOf(func);
      if (index !== -1) {
        handlers.splice(index, 1);
      }

      // 如果监听全部移除，同样停止监听当前事件
      if (handlers.length === 0) {
        this.listeners.delete(event);
      }
    }
    return this;
  }

  clearListener() {
    this.listeners = new Map();
  }

  dispose() {
    if (InteractiveListener.touchableDevice) {
      this.canvas.removeEventListener('touchstart', this.onTouchDown);
      document.removeEventListener('touchmove', this.onTouchMove);
      document.removeEventListener('touchend', this.onTouchUp);
      document.removeEventListener('touchcancel', this.onTouchUp);
    } else {
      this.canvas.removeEventListener('pointerdown', this.onMouseDown);
      document.removeEventListener('pointermove', this.onMouseMove);
      document.removeEventListener('pointerup', this.onMouseUp);
      document.removeEventListener('pointercancel', this.onMouseUp);
      document.removeEventListener('pointerleave', this.onMouseUp);
      this.canvas.removeEventListener('dblclick', this.onDBClick);
      this.canvas.removeEventListener('wheel', this.onWheel);
      this.canvas.removeEventListener('contextmenu', this.preventDefault);
    }
  }

  registerListener() {
    if (InteractiveListener.touchableDevice) {
      this.canvas.addEventListener('touchstart', this.onTouchDown);
      document.addEventListener('touchmove', this.onTouchMove);
      document.addEventListener('touchend', this.onTouchUp);
      document.addEventListener('touchcancel', this.onTouchUp);
    } else {
      this.canvas.addEventListener('pointerdown', this.onMouseDown);
      document.addEventListener('pointermove', this.onMouseMove);
      document.addEventListener('pointerup', this.onMouseUp);
      document.addEventListener('pointercancel', this.onMouseUp);
      document.addEventListener('pointerleave', this.onMouseUp);
      this.canvas.addEventListener('dblclick', this.onDBClick);
      this.canvas.addEventListener('wheel', this.onWheel);
      this.canvas.addEventListener('contextmenu', this.preventDefault);
    }
  }

  private triggerEvent(e: InteractiveEvent, event: PointerEvent | WheelEvent | Touch, extra?: IGesturesExtra | IExtra) {
    // 判断是否在当前视口，不在的过滤掉，不触发
    if (this.viewport) {
      const { x, y, width, height } = this.viewport;
      const p1 = { x, y };
      const p2 = {
        x: x + width,
        y: y + height,
      };
      const rect = [p1, p2];
      const point = getRelativePositionFromEvent(
        {
          x: event.clientX,
          y: event.clientY,
        },
        this.canvas
      );
      if (!point) {
        return;
      }
      const isPointInRect = pointInRect(point, rect);
      if (!isPointInRect) {
        return;
      }
    }
    if (this.listeners.has(e)) {
      const handlers = this.listeners.get(e)!;
      handlers.forEach(handler => handler(event, extra));
    }
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

  private onMouseDown = (event: PointerEvent) => {
    event.preventDefault();
    this.addEventCache(event);
    this.downHandler(this.eventCache);
  };

  private onTouchDown = (event: TouchEvent) => {
    event.preventDefault();
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
      (this.mouseDownInfo && isMouseMoved(this.mouseDownInfo, event, InteractiveListener.moveTolerance))
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
        if (InteractiveListener.touchableDevice) {
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

  private onWheel = (event: WheelEvent) => {
    this.preventDefault(event);
    this.triggerEvent(InteractiveEvent.Wheel, event);
  };

  private onDBClick = (event: PointerEvent) => {
    this.preventDefault(event);
    this.triggerEvent(InteractiveEvent.DBClick, event);
  };

  private preventDefault = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };
}
