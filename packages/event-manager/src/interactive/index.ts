/* eslint-disable @typescript-eslint/member-ordering */
import { TaskPriority, throttleInAFrame, Vec2, Vec3, getRelativePositionFromEvent } from '@turbox3d/shared';
import { CanvasHandlers, InteractiveConfig, InteractiveType, ViewportInfo } from './type';
import { InteractiveListener } from './listener/index';
import { InteractiveEvent, GesturesExtra, Extra } from './listener/type';
import { SceneEvent } from './sceneEvent';
import { CoordinateController } from './coordinate';

export interface HitResult<DisplayObject> {
  /** event 的直接对象 */
  originalTarget?: DisplayObject;
  /** originalTarget 或 originalTarget 的祖先中的第一个可被交互的元素 */
  target?: DisplayObject;
  /** 选中对象的具体场景鼠标位置 */
  originalTargetPoint?: Vec2 | Vec3;
}

interface Option<Container, DisplayObject> {
  renderer: HTMLCanvasElement;
  container: Container;
  canvasHandler: CanvasHandlers;
  coordinateType?: string;
  viewport?: ViewportInfo;
  getCoordinateCtrl: () => CoordinateController;
  getHitTargetOriginal: (
    point: Vec2,
    container: Container,
    configMap: Map<DisplayObject, InteractiveConfig>,
    interactiveType: InteractiveType,
  ) => HitResult<DisplayObject>;
  maxFPS: number;
}

export class InteractiveController<Container, DisplayObject> {
  /** 渲染器对应的 canvas */
  private renderer: HTMLCanvasElement;
  /** 根容器 */
  private container: Container;
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
  private viewport?: ViewportInfo;
  /** 坐标系类型 */
  private coordinateType?: string;
  /** hitTarget 的实现，不同渲染引擎不一样 */
  private getHitTargetOriginal: (
    point: Vec2,
    container: Container,
    configMap: Map<DisplayObject, InteractiveConfig>,
    interactiveType: InteractiveType,
  ) => HitResult<DisplayObject>;
  private getCoordinateCtrl: () => CoordinateController;
  /** 最大帧率限制 */
  private maxFPS = 60;

  constructor(option: Option<Container, DisplayObject>) {
    this.renderer = option.renderer;
    this.container = option.container;
    this.canvasHandlers = option.canvasHandler;
    this.viewport = option.viewport;
    this.coordinateType = option.coordinateType;
    this.getCoordinateCtrl = option.getCoordinateCtrl;
    this.getHitTargetOriginal = option.getHitTargetOriginal;
    this.maxFPS = option.maxFPS;
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
  updateViewportInfo = (viewport: ViewportInfo) => {
    this.viewport = viewport;
    this.interactiveListener.updateViewportInfo(viewport);
  };

  /**
   * 对画布进行交互事件监听
   *
   * @param canvas
   */
  startListener(canvas: HTMLCanvasElement) {
    const { Click, DBClick, RightClick, DragStart, DragMove, DragEnd, Hover, Carriage, CarriageEnd, Wheel, PinchStart, Pinch, PinchEnd, RotateStart, Rotate, RotateEnd, Press, PressUp } = InteractiveEvent;
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
      .addEventListener(Wheel, this.onWheel)
      .addEventListener(PinchStart, this.onPinchStart)
      .addEventListener(Pinch, this.onPinch)
      .addEventListener(PinchEnd, this.onPinchEnd)
      .addEventListener(RotateStart, this.onRotateStart)
      .addEventListener(Rotate, this.onRotate)
      .addEventListener(RotateEnd, this.onRotateEnd)
      .addEventListener(Press, this.onPress)
      .addEventListener(PressUp, this.onPressUp);
  }

  /**
   * 取消所有监听的交互事件
   * @param canvas
   */
  removeAllListener() {
    const { Click, DBClick, RightClick, DragStart, DragMove, DragEnd, Hover, Carriage, CarriageEnd, Wheel, PinchStart, Pinch, PinchEnd, RotateStart, Rotate, RotateEnd, Press, PressUp } = InteractiveEvent;
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
      .removeEventListener(Wheel, this.onWheel)
      .removeEventListener(PinchStart, this.onPinchStart)
      .removeEventListener(Pinch, this.onPinch)
      .removeEventListener(PinchEnd, this.onPinchEnd)
      .removeEventListener(RotateStart, this.onRotateStart)
      .removeEventListener(Rotate, this.onRotate)
      .removeEventListener(RotateEnd, this.onRotateEnd)
      .removeEventListener(Press, this.onPress)
      .removeEventListener(PressUp, this.onPressUp);
    this.interactiveListener.dispose();
  }

  /**
   * 用于给外部发起一次点击拾取
   * @param point 是相对于 canvas 左上角的点击位置
   */
  hitTarget = (point: Vec2) => {
    const originalPoint = this.revisePointByViewPort(point);
    const { target } = this.getHitTargetOriginal(originalPoint, this.container, this.interactiveConfig, 'isClickable');
    if (target) {
      const config = this.interactiveConfig.get(target);
      if (config && config.getViewEntity) {
        return config.getViewEntity();
      }
    }
    return undefined;
  };

  /**
   * 获取本次鼠标事件的交互对象
   */
  private hitTargetHandler(event: PointerEvent | Touch, type: InteractiveType) {
    // 相对于 canvas 左上角的点击位置，量度与事件点击相同
    let originalPoint = getRelativePositionFromEvent({
      x: event.clientX,
      y: event.clientY,
    }, this.renderer);
    // 无法根据事件和 renderer 获取合法的点击位置
    if (!originalPoint) {
      return {};
    }
    originalPoint = this.revisePointByViewPort(originalPoint);
    return this.getHitTargetOriginal(originalPoint, this.container, this.interactiveConfig, type);
  }

  /**
   * 主动传入一个点位做一次 hitTest，返回结果
   * @param point 是相对于 canvas 左上角的点击位置
   */
  hitTargetOriginalByPoint(point: Vec2) {
    const originalPoint = this.revisePointByViewPort(point);
    return this.getHitTargetOriginal(originalPoint, this.container, this.interactiveConfig, 'isClickable');
  }

  private revisePointByViewPort(point: Vec2) {
    if (this.viewport) {
      const { x, y } = this.viewport;
      return { x: point.x - x, y: point.y - y };
    }
    return point;
  }

  private onClick = (event: PointerEvent | Touch) => {
    const { target } = this.hitTargetHandler(event, 'isClickable');
    if (target) {
      this.lastClickTarget = target;
      const config = this.interactiveConfig.get(target);
      if (config && config.isClickable) {
        if (config.onClick) {
          config.onClick(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
        }
        return;
      }
    }
    this.lastClickTarget = undefined;
    // 点击在画布上，没有命中任何目标
    this.canvasHandlers.onClick(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
  };

  private onDBClick = (event: PointerEvent) => {
    // 双击事件使用上次 click 命中的目标，避免重复计算
    if (this.lastClickTarget) {
      const config = this.interactiveConfig.get(this.lastClickTarget);
      if (config && config.isClickable && config.onDBClick) {
        config.onDBClick(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
      }
    }
  };

  private onRightClick = (event: PointerEvent) => {
    const { target } = this.hitTargetHandler(event, 'isClickable');
    if (target) {
      const config = this.interactiveConfig.get(target);
      if (config && config.onRightClick) {
        config.onRightClick(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
        return;
      }
    }
    this.canvasHandlers.onRightClick(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
  };

  private onDragStart = (event: PointerEvent | Touch, extra?: Extra) => {
    const { target } = this.hitTargetHandler(event, 'isDraggable');
    if (target) {
      const config = this.interactiveConfig.get(target);
      if (config && config.isDraggable && config.onDragStart) {
        this.dragTarget = target;
        config.onDragStart(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
      }
      return;
    }
    this.canvasHandlers.onDragStart(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
  };

  private onDragMove = throttleInAFrame((event: PointerEvent | Touch) => {
    if (this.dragTarget) {
      const config = this.interactiveConfig.get(this.dragTarget);
      if (config && config.isDraggable && config.onDragMove) {
        config.onDragMove(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
      }
      return;
    }
    this.canvasHandlers.onDragMove(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
  }, TaskPriority.UserAction, this.maxFPS);

  private onDragEnd = (event: PointerEvent | Touch) => {
    if (this.dragTarget) {
      const config = this.interactiveConfig.get(this.dragTarget);
      if (config && config.isDraggable && config.onDragEnd) {
        config.onDragEnd(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
      }
      this.dragTarget = undefined;
      return;
    }
    this.canvasHandlers.onDragEnd(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
  };

  private onPinchStart = (event: PointerEvent | Touch, extra?: GesturesExtra) => {
    const { target } = this.hitTargetHandler(event, 'isPinchable');
    if (target) {
      const config = this.interactiveConfig.get(target);
      if (config && config.isPinchable && config.onPinchStart) {
        this.dragTarget = target;
        config.onPinchStart(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
      }
      return;
    }
    this.canvasHandlers.onPinchStart(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
  };

  private onPinch = throttleInAFrame((event: PointerEvent | Touch, extra?: GesturesExtra) => {
    if (this.dragTarget) {
      const config = this.interactiveConfig.get(this.dragTarget);
      if (config && config.isPinchable && config.onPinch) {
        config.onPinch(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
      }
      return;
    }
    this.canvasHandlers.onPinch(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
  }, TaskPriority.UserAction, this.maxFPS);

  private onPinchEnd = (event: PointerEvent | Touch, extra?: GesturesExtra) => {
    if (this.dragTarget) {
      const config = this.interactiveConfig.get(this.dragTarget);
      if (config && config.isPinchable && config.onPinchEnd) {
        config.onPinchEnd(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
      }
      this.dragTarget = undefined;
      return;
    }
    this.canvasHandlers.onPinchEnd(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
  };

  private onRotateStart = (event: PointerEvent | Touch, extra?: GesturesExtra) => {
    const { target } = this.hitTargetHandler(event, 'isRotatable');
    if (target) {
      const config = this.interactiveConfig.get(target);
      if (config && config.isRotatable && config.onRotateStart) {
        this.dragTarget = target;
        config.onRotateStart(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
      }
      return;
    }
    this.canvasHandlers.onRotateStart(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
  };

  private onRotate = throttleInAFrame((event: PointerEvent | Touch, extra?: GesturesExtra) => {
    if (this.dragTarget) {
      const config = this.interactiveConfig.get(this.dragTarget);
      if (config && config.isRotatable && config.onRotate) {
        config.onRotate(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
      }
      return;
    }
    this.canvasHandlers.onRotate(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
  }, TaskPriority.UserAction, this.maxFPS);

  private onRotateEnd = (event: PointerEvent | Touch, extra?: GesturesExtra) => {
    if (this.dragTarget) {
      const config = this.interactiveConfig.get(this.dragTarget);
      if (config && config.isRotatable && config.onRotateEnd) {
        config.onRotateEnd(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
      }
      this.dragTarget = undefined;
      return;
    }
    this.canvasHandlers.onRotateEnd(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint, extra));
  };

  private onPress = (event: PointerEvent | Touch) => {
    const { target } = this.hitTargetHandler(event, 'isPressable');
    if (target) {
      const config = this.interactiveConfig.get(target);
      if (config && config.isPressable) {
        if (config.onPress) {
          config.onPress(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
        }
        return;
      }
    }
    this.canvasHandlers.onPress(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
  };

  private onPressUp = (event: PointerEvent | Touch) => {
    const { target } = this.hitTargetHandler(event, 'isPressable');
    if (target) {
      const config = this.interactiveConfig.get(target);
      if (config && config.isPressable) {
        if (config.onPressUp) {
          config.onPressUp(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
        }
        return;
      }
    }
    this.canvasHandlers.onPressUp(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
  };

  private onCarriage = throttleInAFrame((event: PointerEvent) => {
    this.canvasHandlers.onPointerMove(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
  }, TaskPriority.UserAction, this.maxFPS);

  private onCarriageEnd = (event: PointerEvent) => {
    this.canvasHandlers.onPointerUp(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
  };

  private onHover = throttleInAFrame((event: PointerEvent) => {
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
  }, TaskPriority.UserAction, this.maxFPS);

  private onHoverIn(target: DisplayObject, event: PointerEvent) {
    const config = this.interactiveConfig.get(target);
    if (config && config.isHoverable && config.onHoverIn) {
      this.hoverTarget = target;
      config.onHoverIn(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
    }
  }

  private onHoverOut(target: DisplayObject, event: PointerEvent) {
    const config = this.interactiveConfig.get(target);
    if (config && config.isHoverable && config.onHoverOut) {
      config.onHoverOut(SceneEvent.create(event, this.getCoordinateCtrl, this.hitTargetOriginalByPoint));
    }
  }

  private onWheel = throttleInAFrame((event: WheelEvent) => {
    event.stopImmediatePropagation();
    event.preventDefault();
    this.canvasHandlers.onWheel(event);
  }, TaskPriority.UserAction, this.maxFPS);
}
