import { TaskPriority, throttleInAFrame, Vec2, getEventClientPos, getRelativePositionFromEvent } from '@turbox3d/shared';
import { CanvasHandlers, InteractiveConfig, InteractiveType, IViewportInfo, ITransformPos } from './type';
import { InteractiveListener } from './listener/index';
import { InteractiveEvent } from './listener/type';
import { SceneMouseEvent } from './sceneMouse';

interface HitResult<DisplayObject> {
  /** event 的直接对象 */
  originalTarget?: DisplayObject;
  /** originalTarget 或 originalTarget 的祖先中的第一个可被交互的元素 */
  target?: DisplayObject;
}

interface Option<Container, DisplayObject> {
  renderer: HTMLCanvasElement;
  container: Container;
  transformPos: ITransformPos;
  canvasHandler: CanvasHandlers;
  coordinateType?: string;
  viewport?: IViewportInfo;
  hitTargetOriginal: (
    point: Vec2,
    container: Container,
    configMap: Map<DisplayObject, InteractiveConfig>,
    interactiveType: InteractiveType,
  ) => HitResult<DisplayObject>;
}

export class InteractiveController<Container, DisplayObject> {
  /** 渲染器对应的 canvas */
  private renderer: HTMLCanvasElement;
  /** 根容器 */
  private container: Container;
  private transformPos: ITransformPos;
  private interactiveListener: InteractiveListener;
  /** 交互对象的配置 */
  private interactiveConfig: Map<DisplayObject, InteractiveConfig> = new Map();
  /** 画布处理事件 */
  private canvasHandlers: CanvasHandlers;
  /**
   * 当前的拖拽目标
   */
  private dragTarget?: DisplayObject;
  /**
   * 持续 hover 的目标
   */
  private hoverTarget?: DisplayObject;
  /** 上次点击命中的目标 */
  private lastClickTarget?: DisplayObject;
  /** 当前视口的区域信息 */
  private viewport?: IViewportInfo;
  /** 坐标系类型 */
  private coordinateType?: string;
  /** hitTarget 的实现，不同渲染引擎不一样 */
  private hitTargetOriginal: (
    point: Vec2,
    container: Container,
    configMap: Map<DisplayObject, InteractiveConfig>,
    interactiveType: InteractiveType,
  ) => HitResult<DisplayObject>;

  constructor(option: Option<Container, DisplayObject>) {
    this.renderer = option.renderer;
    this.container = option.container;
    this.transformPos = option.transformPos;
    this.canvasHandlers = option.canvasHandler;
    this.viewport = option.viewport;
    this.coordinateType = option.coordinateType;
    this.hitTargetOriginal = option.hitTargetOriginal;
  }

  /**
   * 更新视图对象的交互配置
   *
   * @param view 视图对象
   * @param config 交互配置。该参数不传时认为该对象无法交互
   */
  updateInteractiveObject = (view: DisplayObject, config?: InteractiveConfig) => {
    if (config) {
      this.interactiveConfig.set(view, config);
    } else {
      this.interactiveConfig.delete(view);
    }
  };

  /** 更新视口信息 */
  updateViewportInfo = (viewport: IViewportInfo) => {
    this.viewport = viewport;
    this.interactiveListener.updateViewportInfo(viewport);
  }

  /**
   * 对画布进行交互事件监听
   *
   * @param canvas
   */
  startListener(canvas: HTMLCanvasElement) {
    const { Click, DBClick, RightClick, DragStart, DragMove, DragEnd, Hover, Carriage, CarriageEnd, Wheel } = InteractiveEvent;
    this.interactiveListener = InteractiveListener.create(canvas, this.viewport, this.coordinateType);
    this.interactiveListener.registerListener();
    this.interactiveListener
      .addEventListener(Click, this.onClick)
      .addEventListener(DBClick, this.onDBClick)
      .addEventListener(RightClick, this.onRightClick)
      .addEventListener(DragStart, this.onDragStart)
      .addEventListener(DragMove, this.onDragMove)
      .addEventListener(DragEnd, this.onDragEnd)
      .addEventListener(Hover, this.onHover)
      .addEventListener(Carriage, this.onCarriage)
      .addEventListener(CarriageEnd, this.onCarriageEnd)
      .addEventListener(Wheel, this.onWheel);
  }

  /**
   * 取消所有监听的交互事件
   * @param canvas
   */
  removeAllListener() {
    const { Click, DBClick, RightClick, DragStart, DragMove, DragEnd, Hover, Carriage, CarriageEnd, Wheel } = InteractiveEvent;
    this.interactiveListener
      .removeEventListener(Click, this.onClick)
      .removeEventListener(DBClick, this.onDBClick)
      .removeEventListener(RightClick, this.onRightClick)
      .removeEventListener(DragStart, this.onDragStart)
      .removeEventListener(DragMove, this.onDragMove)
      .removeEventListener(DragEnd, this.onDragEnd)
      .removeEventListener(Hover, this.onHover)
      .removeEventListener(Carriage, this.onCarriage)
      .removeEventListener(CarriageEnd, this.onCarriageEnd)
      .removeEventListener(Wheel, this.onWheel);
    this.interactiveListener.dispose();
  }

  /**
   * 用于给外部发起一次点击拾取
   */
  hitTarget = (point: Vec2) => {
    const originalPoint = this.revisePointByViewPort(point);
    const { target } = this.hitTargetOriginal(originalPoint, this.container, this.interactiveConfig, 'isClickable');
    if (target) {
      const config = this.interactiveConfig.get(target);
      if (config && config.getViewEntity) {
        return config.getViewEntity();
      }
    }
    return undefined;
  }

  /**
   * 获取本次鼠标事件的交互对象
   */
  private hitTargetHandler(event: MouseEvent, type: InteractiveType) {
    // 相对于 canvas 左上角的点击位置，量度与事件点击相同
    let originalPoint = getRelativePositionFromEvent(getEventClientPos(event), this.renderer);
    // 无法根据事件和 renderer 获取合法的点击位置
    if (!originalPoint) {
      return {};
    }
    originalPoint = this.revisePointByViewPort(originalPoint);
    return this.hitTargetOriginal(originalPoint, this.container, this.interactiveConfig, type);
  }

  private revisePointByViewPort(point: Vec2) {
    if (this.viewport) {
      const { x, y } = this.viewport;
      return { x: point.x - x, y: point.y - y };
    }
    return point;
  }

  private onClick = (event: MouseEvent) => {
    const { target } = this.hitTargetHandler(event, 'isClickable');
    if (target) {
      this.lastClickTarget = target;
      const config = this.interactiveConfig.get(target);
      if (config && config.isClickable) {
        if (config.onClick) {
          config.onClick(SceneMouseEvent.create(event, this.transformPos));
        }
        return;
      }
    }
    this.lastClickTarget = undefined;
    // 点击在画布上，没有命中任何目标
    this.canvasHandlers.onClick(SceneMouseEvent.create(event, this.transformPos));
  };

  private onDBClick = (event: MouseEvent) => {
    // 双击事件使用上次 click 命中的目标，避免重复计算
    if (this.lastClickTarget) {
      const config = this.interactiveConfig.get(this.lastClickTarget);
      if (config && config.isClickable && config.onDBClick) {
        config.onDBClick(SceneMouseEvent.create(event, this.transformPos));
      }
    }
  };

  private onRightClick = (event: MouseEvent) => {
    const { target } = this.hitTargetHandler(event, 'isClickable');
    if (target) {
      const config = this.interactiveConfig.get(target);
      if (config && config.onRightClick) {
        config.onRightClick(SceneMouseEvent.create(event, this.transformPos));
        return;
      }
    }
    this.canvasHandlers.onRightClick(SceneMouseEvent.create(event, this.transformPos));
  }

  private onDragStart = (event: MouseEvent) => {
    const { target } = this.hitTargetHandler(event, 'isDraggable');

    if (target) {
      const config = this.interactiveConfig.get(target);
      if (config && config.isDraggable && config.dragStart) {
        this.dragTarget = target;
        config.dragStart(SceneMouseEvent.create(event, this.transformPos));
      }
      return;
    }

    this.canvasHandlers.onDragStart(SceneMouseEvent.create(event, this.transformPos));
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private onDragMove = throttleInAFrame((event: MouseEvent) => {
    if (this.dragTarget) {
      const config = this.interactiveConfig.get(this.dragTarget);
      if (config && config.isDraggable && config.dragMove) {
        config.dragMove(SceneMouseEvent.create(event, this.transformPos));
      }
      return;
    }
    this.canvasHandlers.onDragMove(SceneMouseEvent.create(event, this.transformPos));
  }, TaskPriority.UserAction);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private onDragEnd = throttleInAFrame((event: MouseEvent) => {
    if (this.dragTarget) {
      const config = this.interactiveConfig.get(this.dragTarget);
      if (config && config.isDraggable && config.dragEnd) {
        config.dragEnd(SceneMouseEvent.create(event, this.transformPos));
      }
      this.dragTarget = undefined;
      return;
    }
    this.canvasHandlers.onDragEnd(SceneMouseEvent.create(event, this.transformPos));
  }, TaskPriority.UserAction);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private onCarriage = throttleInAFrame((event: MouseEvent) => {
    this.canvasHandlers.onMouseMove(SceneMouseEvent.create(event, this.transformPos));
  }, TaskPriority.UserAction);

  private onCarriageEnd = (event: MouseEvent) => {
    this.canvasHandlers.onMouseUp(SceneMouseEvent.create(event, this.transformPos));
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private onHover = throttleInAFrame((event: MouseEvent) => {
    const { target } = this.hitTargetHandler(event, 'isHoverable');
    if (target) {
      // 如果 hover 目标产生了变更
      if (this.hoverTarget) {
        if (target !== this.hoverTarget) {
          // 对上一次目标执行 hoverOut
          this.onHoverOut(this.hoverTarget, event);

          // 对新目标执行 hoverIn
          this.onHoverIn(target, event);
        }
      } else {
        this.onHoverIn(target, event);
      }
    } else if (this.hoverTarget) {
      this.onHoverOut(this.hoverTarget, event);
      this.hoverTarget = undefined;
    }
  }, TaskPriority.UserAction);

  private onHoverIn(target: DisplayObject, event: MouseEvent) {
    const config = this.interactiveConfig.get(target);
    if (config && config.isHoverable && config.onHoverIn) {
      this.hoverTarget = target;
      config.onHoverIn(SceneMouseEvent.create(event, this.transformPos));
    }
  }

  private onHoverOut(target: DisplayObject, event: MouseEvent) {
    const config = this.interactiveConfig.get(target);
    if (config && config.isHoverable && config.onHoverOut) {
      config.onHoverOut(SceneMouseEvent.create(event, this.transformPos));
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private onWheel = throttleInAFrame((event: WheelEvent) => {
    event.stopImmediatePropagation();
    event.preventDefault();
    this.canvasHandlers.onWheel(event);
  }, TaskPriority.UserAction);
}
