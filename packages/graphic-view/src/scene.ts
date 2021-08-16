/* eslint-disable @typescript-eslint/member-ordering */
import { BaseCommandBox, CommandEventType, ITool } from '@turbox3d/command-manager';
import { CoordinateController, CoordinateType, InteractiveConfig, InteractiveController, InteractiveType, SceneMouseEvent } from '@turbox3d/event-manager';
import { Vec2, Vec3 } from '@turbox3d/shared';
import React from 'react';

declare global {
  interface Window {
    $$turbox_hot: boolean;
  }
}

interface IInteractiveControllerInfo<Container, DisplayObject> {
  [id: string]: InteractiveController<Container, DisplayObject>;
}

export interface IViewportInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  resolution?: number;
}

export enum SceneType {
  Scene2D = '2d',
  Scene3D = '3d',
}

export interface BaseSceneProps {
  /**
   * 用以标示当前场景的 ID
   */
  id: string;
  /**
   * 用以标示当前场景的 symbol
   */
  type?: symbol;
  /**
   * 画布的 DOM 容器
   * 可接受 ID 或者 DOM 元素
   * 当多个场景向同一个 dom 插入时默认创建多个根视图容器，而不是新的 canvas
   */
  container: string | HTMLElement;
  /**
   * 根视图容器参数（在一个 renderer 中渲染多个子视图并互相隔离时使用）
   */
  viewport?: IViewportInfo;
  /**
   * 创建画布的宽度。默认：600
   */
  width?: number;
  /**
   * 创建画布的高度。默认：400
   */
  height?: number;
  /**
   * 画布背景色，使用十六进制。默认：0xffffff
   */
  backgroundColor?: number;
  /**
   * 画布背景图，优先级高于背景色
   */
  backgroundImage?: string;
  /**
   * 天空盒背景图，只有 3d 下才有效，图片列表顺序 pos-x, neg-x, pos-y, neg-y, pos-z, neg-z
   */
  skyBoxImages?: string[];
  /**
   * 是否画布透明。默认：false
   */
  transparent?: boolean;
  /**
   * 画布是否可缩放。默认：true
   */
  scalable?: boolean;
  /**
   * 画布是否可拖拽。默认：true
   */
  draggable?: boolean;
  /**
   * 点击场景未选中任何目标的回调
   */
  onClickNothing?: (event: SceneMouseEvent) => void;
  /**
   * 处理本场景的 commandBox
   */
  commandBox?: BaseCommandBox;
  /**
   * 2d 相机的尺寸（x是宽度、y是高度）单位：毫米
   */
  camera2dSize?: Vec2;
  /** 相机的初始位置 */
  cameraPosition: Vec3 | Vec2;
  /** 相机看向的位置，只有 3d 下有 */
  cameraTarget?: Vec3;
  /** 相机控制器的开关，只有 3d 下有 */
  cameraControls?: boolean;
  /** 坐标系类型 */
  coordinateType?: 'top' | 'front' | 'left';
  /** resizeTo 适配的 dom id 或元素引用 */
  resizeTo?: string | HTMLElement | Window;
  /** 根据 container 容器的实际大小实时适配，不推荐使用 */
  resizeByContainerStyle?: boolean;
  /** 分辨率 */
  resolution?: number;
  /** 是否允许使用允许 toDataUrl 获取画布数据 */
  allowUseData?: boolean;
  /** resizeFramebuffer */
  resizeFramebuffer?: boolean;
  /** 颜色输出模式 renderer.outputEncoding */
  outputEncoding?: number;
}

export interface IViewInfo {
  position: Vec2 | Vec3;
  scale: Vec2 | Vec3;
  visible: boolean;
  width?: number;
  height?: number;
}

export interface SceneContext<DisplayObject, Point> {
  updateInteractiveObject: (view: DisplayObject, config?: InteractiveConfig) => void;
  updateCursor: (cursor?: string) => void;
  getCommandBox: () => BaseCommandBox | undefined;
  getTools: () => ITool;
  coordinateTransform: (point: Point, type: CoordinateType) => Point;
  getScreenShot: () => string;
}

export abstract class BaseScene<ApplicationContext, Scene, Camera, Raycaster, Container, DisplayObject, Viewport> extends React.Component<BaseSceneProps> {
  /** 默认背景色 */
  static BACKGROUND_COLOR = 0xffffff;
  /** 默认是否透明 */
  static TRANSPARENT = false;
  /** 默认画布宽度 */
  static DEFAULT_WIDTH = 600;
  /** 默认画布高度 */
  static DEFAULT_HEIGHT = 400;
  // static DEFAULT_SCALE_NUM = 0.01;
  static SCALE_BIGGER = 1.1;
  static SCALE_SMALLER = 1 / 1.1;
  /** 挂载点与应用上下文的映射关系 */
  static appMap = new Map<string | HTMLElement, any>();
  /** 应用上下文与不同视角交互控制器的映射关系 */
  static interactiveMap = new Map<any, IInteractiveControllerInfo<any, any>>();
  /** 应用上下文是否已经挂载的状态 */
  static appMountedStatus = new Map<string | HTMLElement, boolean>();
  /** 模型实际容器 */
  view: Container;
  /** 默认的场景视图类型标识 */
  abstract defaultSceneViewType: symbol;
  /** 模型视口容器（有多视图的时候才有） */
  viewport?: Viewport;
  /** 场景类型，标识是 2d 还是 3d 场景 */
  abstract sceneType: SceneType;
  /** 场景实例，仅 3d 下有 */
  scene?: Scene;
  /** 相机实例，仅 3d 下有 */
  camera?: Camera;
  /** 射线实例，仅 3d 下有 */
  raycaster?: Raycaster;

  width: number = BaseScene.DEFAULT_WIDTH;

  height: number = BaseScene.DEFAULT_HEIGHT;

  coordinate: CoordinateController;

  mountTimer: number;

  sceneContext: SceneContext<DisplayObject, Vec2>;

  resolution: number;

  constructor(props: BaseSceneProps) {
    super(props);
    if (this.props.viewport) {
      this.resolution = this.props.viewport.resolution || window.devicePixelRatio;
    } else {
      this.resolution = this.props.resolution || window.devicePixelRatio;
    }
    if (!BaseScene.appMap.has(this.props.container)) {
      const app = this.createApp();
      // 关闭默认交互
      this.destroyRendererInteraction(app);
      // 缓存，挂载到同一元素的使用一个 gl 上下文
      BaseScene.appMap.set(this.props.container, app);
    }
    this.view = this.createView();
    // 初始化坐标系系统
    const tempApp = this.getCurrentApp();
    if (tempApp) {
      this.coordinate = this.createCoordinateController(tempApp);
    }
    // 初始化交互控制器
    this.initInteractiveController();
    const ctrl = this.getCurrentInteractiveController();
    this.sceneContext = {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      updateInteractiveObject: ctrl ? ctrl.updateInteractiveObject : () => {},
      updateCursor: this.getCursor,
      getCommandBox: () => this.props.commandBox,
      getTools: this.getTools,
      coordinateTransform: this.coordinateTransform,
      getScreenShot: () => this.getScreenShot(),
    };
  }

  componentDidMount() {
    this.mountCanvas();
  }

  componentDidUpdate() {
    const { resizeByContainerStyle = false, viewport } = this.props;
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    if (resizeByContainerStyle && app) {
      this.resizeStageByCanvas(app);
    }
    this.resolution = this.props.resolution || window.devicePixelRatio;
    this.updateResolution(app);
    if (this.sceneType === SceneType.Scene3D) {
      this.updateCameraInfo();
    }
    if (!viewport) {
      return;
    }
    const ctrl = this.getCurrentInteractiveController();
    if (ctrl) {
      ctrl.updateViewportInfo(viewport);
    }
    this.resolution = viewport.resolution || window.devicePixelRatio;
    this.updateResolution(app);
    this.resizeViewport(app);
    // 重新计算原始 view
    if (this.sceneType === SceneType.Scene2D) {
      this.compute2dOriginView();
    }
    // 重新计算 viewport
    this.computeViewport();
  }

  componentWillUnmount() {
    if (window.$$turbox_hot) {
      const app = this.getCurrentApp();
      if (app) {
        this.removeAppChildrenView(app);
      }
      return;
    }
    // 如果视图还未挂载，则取消挂在任务
    this.mountTimer && cancelAnimationFrame(this.mountTimer);
    // 取消事件监听
    const ctrl = this.getCurrentInteractiveController();
    if (ctrl) {
      ctrl.removeAllListener();
    }
    if (BaseScene.appMap.has(this.props.container)) {
      const app = this.getCurrentApp();
      if (app) {
        this.destroyApp(app);
      }
      BaseScene.appMap.delete(this.props.container);
      BaseScene.appMountedStatus.delete(this.props.container);
    }
    window.removeEventListener('resize', this.resizeHandler, false);
  }

  /** 移除应用子视图 */
  abstract removeAppChildrenView(app: ApplicationContext): void;

  /** 销毁 gl app 及相关清理工作的实现 */
  abstract destroyApp(app: ApplicationContext): void;

  /** 创建 gl app instance，并返回 */
  abstract createApp(): ApplicationContext;

  /** 创建根视图，给 view 设值 */
  abstract createView(): Container;

  /** 获取根视图的基本信息（position、scale、visible） */
  abstract getViewInfo(): IViewInfo;

  /** 添加子视图的接口 */
  abstract addChildView(view: DisplayObject): void;

  /** 关闭渲染器的默认交互 */
  abstract destroyRendererInteraction(app: ApplicationContext): void;

  abstract getCanvasView(app: ApplicationContext): HTMLCanvasElement;

  /** 获取 hitTarget 的原始实现方法 */
  abstract getHitTargetOriginal(): (
    point: Vec2,
    container: Container,
    configMap: Map<DisplayObject, InteractiveConfig>,
    interactiveType: InteractiveType,
  ) => ({
    /** event 的直接对象 */
    originalTarget?: DisplayObject;
    /** originalTarget 或 originalTarget 的祖先中的第一个可被交互的元素 */
    target?: DisplayObject;
    /** 选中对象的具体场景鼠标位置 */
    originalTargetPoint?: Vec2 | Vec3;
  });

  /** 更新分辨率 */
  abstract updateResolution(app: ApplicationContext): void;

  private initInteractiveController() {
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    const interactiveController = new InteractiveController<Container, DisplayObject>({
      renderer: this.getCanvasView(app),
      container: this.view,
      viewport: this.props.viewport,
      coordinateType: this.props.coordinateType,
      canvasHandler: {
        onClick: this.onClick,
        onRightClick: this.onRightClick,
        onDragStart: this.onDragStart,
        onDragMove: this.onDragMove,
        onDragEnd: this.onDragEnd,
        onMouseMove: this.onMouseMove,
        onMouseUp: this.onMouseUp,
        onWheel: this.onWheel,
      },
      getCoordinateCtrl: this.getCoordinateCtrl,
      getHitTargetOriginal: this.getHitTargetOriginal(),
    });
    const obj = BaseScene.interactiveMap.get(app);
    if (!obj) {
      BaseScene.interactiveMap.set(app, {
        [this.props.id]: interactiveController,
      });
    } else {
      const ic = obj[this.props.id];
      ic && ic.removeAllListener();
      obj[this.props.id] = interactiveController;
    }
  }

  private getCoordinateCtrl = () => this.coordinate;

  private getViewEntity() {
    return {
      id: this.props.id,
      type: this.props.type || this.defaultSceneViewType,
    };
  }

  getCurrentInteractiveController = () => {
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    const obj = BaseScene.interactiveMap.get(app);
    if (!obj) {
      return;
    }
    return obj[this.props.id];
  };

  getCurrentApp = () => BaseScene.appMap.get(this.props.container) as ApplicationContext | undefined;

  private getCursor = (cursor = 'inherit') => {
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    this.updateCursor(app, cursor);
  };

  abstract updateCursor(app: ApplicationContext, cursor: string): void;

  private getTools = () => {
    const ctrl = this.getCurrentInteractiveController();
    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      hitTarget: ctrl ? ctrl.hitTarget : (() => { }) as (point: Vec2) => undefined,
      coordinateTransform: this.coordinateTransform,
      getCamera: () => this.camera,
      getRaycaster: () => this.raycaster,
    };
  };

  /**
   * 坐标转化
   */
  private coordinateTransform = (point: Vec2, type: CoordinateType) => (this.coordinate ? this.coordinate.transform(point, type) : { x: 0, y: 0 });

  /**
   * 挂在画布到容器上
   */
  private mountCanvas = () => {
    const container = typeof this.props.container === 'string' ? document.getElementById(this.props.container) : this.props.container;
    // 如果容器 DOM 没有准备好，留到下一帧再检测
    if (!container) {
      this.mountTimer = requestAnimationFrame(this.mountCanvas);
      return;
    }
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    // 挂载
    if (!BaseScene.appMountedStatus.has(this.props.container)) {
      BaseScene.appMountedStatus.set(this.props.container, true);
      if (window.$$turbox_hot) {
        container.innerHTML = '';
      }
      container.appendChild(this.getCanvasView(app));
    }
    // 根据容器大小确定画布大小
    this.resizeStageByCanvas(app);
    // 初始化背景图
    this.initBackGroundImage(app);
    if (this.sceneType === SceneType.Scene3D) {
      // 更新相机信息
      this.updateCameraInfo();
      // 初始化天空盒
      this.initSkyBox(app);
    }
    // 初始化模型容器
    this.initViewContainer();
    // 开始监听画布上的交互
    const ctrl = this.getCurrentInteractiveController();
    ctrl && ctrl.startListener(this.getCanvasView(app));
    window.addEventListener('resize', this.resizeHandler, false);
  };

  private updateCameraInfo() {
    const { cameraTarget, cameraPosition } = this.props;
    this.updateCameraTarget({
      x: cameraTarget?.x || 0,
      y: cameraTarget?.y || 0,
      z: cameraTarget?.z || 0,
    });
    this.updateCameraPosition({
      x: cameraPosition?.x || 0,
      y: cameraPosition?.y || 0,
      z: (cameraPosition as Vec3)?.z || 0,
    });
  }

  /** 更新相机位置 */
  abstract updateCameraPosition(position: Vec3): void;

  /** 更新相机看向的点 */
  abstract updateCameraTarget(position: Vec3): void;

  private resizeHandler = () => {
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    this.resizeStageByCanvas(app);
  }

  /** 初始化坐标系控制系统 */
  abstract createCoordinateController(app: ApplicationContext): CoordinateController;

  private resizeStageByCanvas(app: ApplicationContext) {
    const { viewport } = this.props;
    if (viewport) {
      this.resizeViewport(app);
    }
    this.resizeStage(app);
    this.width = this.getCanvasView(app).width / this.resolution;
    this.height = this.getCanvasView(app).height / this.resolution;
  }

  /** 初始化天空盒 */
  abstract initSkyBox(app: ApplicationContext): void;

  /**
   * resize 场景大小
   */
  abstract resizeStage(app: ApplicationContext): void;

  /** 初始化背景图 */
  abstract initBackGroundImage(app: ApplicationContext): void;

  /**
   * 计算2d原始视图的缩放和位置
   */
  private compute2dOriginView = () => {
    const { camera2dSize, cameraPosition, coordinateType, viewport } = this.props;
    const width = viewport ? viewport.width : this.width;
    const height = viewport ? viewport.height : this.height;
    const rangeW = (camera2dSize && camera2dSize.x) || width;
    const rangeH = (camera2dSize && camera2dSize.y) || height;
    // 根据相机范围计算模型容器的缩放比例
    // 取二者中较小值，保证可以完整的展示场景
    const scale = Math.min(width / rangeW, height / rangeH);
    const centerX = width / 2;
    const centerY = height / 2;
    const pX = cameraPosition.x === void 0 ? centerX : cameraPosition.x;
    let pY: number;
    if (cameraPosition.y === void 0) {
      pY = centerY;
    } else if (coordinateType === 'front' || coordinateType === 'left') {
      pY = -cameraPosition.y;
    } else {
      pY = cameraPosition.y;
    }
    // 模型世界坐标以画布中心为原点
    const x = centerX - pX * scale;
    const y = centerY - pY * scale;
    if (viewport) {
      this.setViewVisible(viewport.visible);
    }
    this.setViewPosition({ x, y });
    if (coordinateType === 'front' || coordinateType === 'left') {
      this.setViewScale({ x: scale, y: -scale });
    } else {
      this.setViewScale({ x: scale, y: scale });
    }
  };

  /** 计算视口的缩放和位置、可见性 */
  private computeViewport() {
    const { viewport } = this.props;
    if (!viewport) {
      return;
    }
    // resize 提高性能做法：放大对应视口的精灵，先让显示逻辑正确
    const viewportInfo = this.getViewportInfo();
    if (viewportInfo && viewportInfo.width && viewportInfo.width > 0 && viewportInfo.height && viewportInfo.height > 0) {
      const ratio = Math.min(viewport.width / viewportInfo.width, viewport.height / viewportInfo.height);
      const scale = viewportInfo!.scale;
      this.setViewportScale({ x: scale.x * ratio, y: scale.y * ratio });
    }
    // 重新计算对应视口的精灵
    this.setViewportPosition({ x: viewport.x, y: viewport.y });
    this.setViewportVisible(viewport.visible);
  }

  /** resize 视口 */
  abstract resizeViewport(app: ApplicationContext): void;

  /** 设置根视图的位置 */
  abstract setViewPosition(position: Partial<Vec3>): void;

  /** 设置根视图的缩放 */
  abstract setViewScale(scale: Partial<Vec3>): void;

  /** 设置根视图是否可见 */
  abstract setViewVisible(visible: boolean): void;

  /** 初始化模型容器 */
  private initViewContainer() {
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    if (this.sceneType === SceneType.Scene2D) {
      this.compute2dOriginView();
    }
    this.addRootViewContainer(app);
  }

  /** 添加根视图容器到 app stage 的实现 */
  abstract addRootViewContainer(app: ApplicationContext): void;

  onClick = (event: SceneMouseEvent) => {
    const { onClickNothing, commandBox } = this.props;
    if (onClickNothing) {
      onClickNothing(event);
    }
    if (commandBox) {
      commandBox.distributeEvent(CommandEventType.onClick, this.getViewEntity(), event, this.getTools());
    }
  };

  onRightClick = (event: SceneMouseEvent) => {
    const { commandBox } = this.props;
    if (commandBox) {
      commandBox.distributeEvent(CommandEventType.onRightClick, this.getViewEntity(), event, this.getTools());
    }
  };

  onDragStart = (event: SceneMouseEvent) => {
    const { draggable = true, commandBox } = this.props;
    if (draggable) {
      this.canvasDragImpl(event, 'start');
    }
    if (commandBox) {
      commandBox.distributeEvent(CommandEventType.onDragStart, this.getViewEntity(), event, this.getTools());
    }
  };

  onDragMove = (event: SceneMouseEvent) => {
    const { draggable = true, commandBox } = this.props;
    if (draggable) {
      this.canvasDragImpl(event, 'move');
    }
    if (commandBox) {
      commandBox.distributeEvent(CommandEventType.onDragMove, this.getViewEntity(), event, this.getTools());
    }
  };

  onDragEnd = (event: SceneMouseEvent) => {
    const { draggable, commandBox } = this.props;
    if (draggable) {
      this.canvasDragImpl(event, 'end');
    }
    if (commandBox) {
      commandBox.distributeEvent(CommandEventType.onDragEnd, this.getViewEntity(), event, this.getTools());
    }
  };

  onMouseMove = (event: SceneMouseEvent) => {
    const { commandBox } = this.props;
    if (commandBox) {
      commandBox.distributeEvent(CommandEventType.onCarriageMove, this.getViewEntity(), event, this.getTools());
    }
  };

  onMouseUp = (event: SceneMouseEvent) => {
    const { commandBox } = this.props;
    if (commandBox) {
      commandBox.distributeEvent(CommandEventType.onCarriageEnd, this.getViewEntity(), event, this.getTools());
    }
  };

  onWheel = (event: WheelEvent) => {
    const { scalable = true, commandBox } = this.props;
    if (scalable) {
      this.canvasScaleImpl(event);
    }
    const ctrl = this.getCurrentInteractiveController();
    if (commandBox && ctrl) {
      commandBox.distributeEvent(CommandEventType.onZoom, this.getViewEntity(), SceneMouseEvent.create(event, this.getCoordinateCtrl, ctrl.hitTargetOriginalByPoint), this.getTools());
    }
  };

  /** 画布拖拽功能的实现，注意：如果已经引入其他交互插件则无需重复实现，避免实现上的冲突 */
  abstract canvasDragImpl(event: SceneMouseEvent, type: 'start' | 'move' | 'end'): void;

  /** 画布缩放功能的实现，注意：如果已经引入其他交互插件则无需重复实现，避免实现上的冲突 */
  abstract canvasScaleImpl(event: WheelEvent): void;

  /** 获取视口的实现 */
  abstract getViewport(): Viewport | undefined;

  /** 获取视口基础信息的实现 */
  abstract getViewportInfo(): IViewInfo | undefined;

  /** 初始化视口，给 viewport 设值 */
  abstract createViewport(): void;

  /** 设置视口的位置 */
  abstract setViewportPosition(position: Partial<Vec3>): void;

  /** 设置视口的缩放 */
  abstract setViewportScale(scale: Partial<Vec3>): void;

  /** 设置视口是否可见 */
  abstract setViewportVisible(visible: boolean): void;

  /** 获取截图 */
  abstract getScreenShot(): string;
}
