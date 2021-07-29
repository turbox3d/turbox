import { getRelativePositionFromEvent, getEventClientPos, pointInRect } from '@turbox3d/shared';
import { DragStatus, ICallBack, IFunc, InteractiveEvent, MouseDealType } from './type';
import { isMouseMoved } from './utils';
import { IViewportInfo } from '../type';

/**
 * 场景鼠标交互事件转化器
 * 将目标画布上的鼠标事件转化为场景之间，诸如：onClick, onDrag, onCarriage, onHover ...
 */
export class InteractiveListener {
  static create(canvas: HTMLCanvasElement, viewport?: IViewportInfo, coordinateType?: string) {
    return new InteractiveListener(canvas, viewport, coordinateType);
  }
  private listeners: Map<InteractiveEvent, IFunc[]> = new Map();
  /** 渲染器的 canvas 元素 */
  private canvas: HTMLCanvasElement;
  /** 当前鼠标是否处于按下状态 */
  private isMouseDown = false;
  /** mousedown 事件缓存 */
  private mouseDownEvent: MouseEvent;
  /** 当前的拖拽状态 */
  private dragStatus: DragStatus = DragStatus.Ready;
  /** 当次鼠标事件处理类型 */
  private mouseDealType: MouseDealType = MouseDealType.Click;
  /** 视口信息 */
  private viewport?: IViewportInfo;
  /** 坐标轴类型 */
  private coordinateType?: string;

  constructor(canvas: HTMLCanvasElement, viewport?: IViewportInfo, coordinateType?: string) {
    this.canvas = canvas;
    this.viewport = viewport;
    this.coordinateType = coordinateType;
  }

  updateViewportInfo = (viewport: IViewportInfo) => {
    this.viewport = viewport;
  }

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
    this.canvas.removeEventListener('dblclick', this.onDBClick);
    this.canvas.removeEventListener('pointerdown', this.onMouseDown);
    this.canvas.removeEventListener('pointermove', this.onMouseMove);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('contextmenu', this.preventDefault);
  }

  registerListener() {
    this.canvas.addEventListener('dblclick', this.onDBClick);
    this.canvas.addEventListener('pointerdown', this.onMouseDown);
    this.canvas.addEventListener('pointermove', this.onMouseMove);
    this.canvas.addEventListener('wheel', this.onWheel);
    this.canvas.addEventListener('contextmenu', this.preventDefault);
  }

  private triggerEvent(e: InteractiveEvent, event: MouseEvent | WheelEvent) {
    // 判断是否在当前视口，不在的过滤掉，不触发
    if (this.viewport) {
      const { x, y, width, height } = this.viewport;
      const p1 = { x, y };
      const p2 = {
        x: x + width,
        y: y + height,
      };
      const rect = [p1, p2];
      const point = getRelativePositionFromEvent(getEventClientPos(event), this.canvas);
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
      handlers.forEach(handler => handler(event));
    }
  }

  private onClick = (event: MouseEvent) => {
    this.triggerEvent(InteractiveEvent.Click, event);
  };

  private onDBClick = (event: MouseEvent) => {
    this.triggerEvent(InteractiveEvent.DBClick, event);
  };

  private onRightClick = (event: MouseEvent) => {
    this.triggerEvent(InteractiveEvent.RightClick, event);
  };

  private onMouseDown = (event: MouseEvent) => {
    this.isMouseDown = true;
    this.mouseDealType = MouseDealType.Click;
    this.dragStatus = DragStatus.Ready;
    this.mouseDownEvent = event;
    document.addEventListener('pointerup', this.onMouseUp);
  };

  private onMouseUp = (event: MouseEvent) => {
    this.isMouseDown = false;
    if (this.mouseDealType === MouseDealType.Drag) {
      this.triggerEvent(InteractiveEvent.DragEnd, event);
    } else if (this.mouseDealType === MouseDealType.Click) {
      if (event.button === 0) {
        this.onClick(event);
      } else if (event.button === 2) {
        this.onRightClick(event);
      }
    }
    this.triggerEvent(InteractiveEvent.CarriageEnd, event);
    document.removeEventListener('pointerup', this.onMouseUp);
  };

  private onMouseMove = (event: MouseEvent) => {
    if (this.isMouseDown) {
      // 鼠标按下状态
      if (this.mouseDealType === MouseDealType.Drag || isMouseMoved(this.mouseDownEvent, event, 4)) {
        this.mouseDealType = MouseDealType.Drag;
        if (this.dragStatus === DragStatus.Ready) {
          this.dragStatus = DragStatus.Dragging;
          this.triggerEvent(InteractiveEvent.DragStart, this.mouseDownEvent);
        } else if (this.dragStatus === DragStatus.Dragging) {
          this.triggerEvent(InteractiveEvent.DragMove, event);
        }
      }
    } else {
      this.triggerEvent(InteractiveEvent.Hover, event);
      this.triggerEvent(InteractiveEvent.Carriage, event);
    }
  };

  private onWheel = (event: WheelEvent) => {
    this.preventDefault(event);
    this.triggerEvent(InteractiveEvent.Wheel, event);
  };

  private preventDefault = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };
}
