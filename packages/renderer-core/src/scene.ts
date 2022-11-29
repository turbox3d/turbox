/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable react/no-deprecated */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/member-ordering */
import { CoordinateController, CoordinateType, InteractiveConfig, InteractiveController, InteractiveType, SceneEvent, EventType, ViewEntity } from '@turbox3d/event-manager';
import { remove, Vec2, Vec3 } from '@turbox3d/shared';
import { SceneTool, CommandManager } from '@turbox3d/command-manager';
import { Component, ComponentProps } from './component';

declare global {
  interface Window {
    $$turbox_hot: boolean;
  }
}

interface IInteractiveControllerInfo<Container, DisplayObject> {
  [id: string]: InteractiveController<Container, DisplayObject>;
}

export interface ViewportInfo {
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
  viewport?: ViewportInfo;
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
  onClickNothing?: (event: SceneEvent) => void;
  /**
   * 处理本场景的 commandMgr
   */
  commandMgr?: CommandManager;
  /**
   * 2d 相机的尺寸（x是宽度、y是高度）单位：毫米
   */
  camera2dSize?: Vec2;
  /** 相机的初始位置 */
  cameraPosition: Vec3 | Vec2;
  /** 视椎体的大小（高度），只供 3d 正交相机使用 */
  frustumSize?: number;
  /** 坐标系类型 */
  coordinateType?: 'top' | 'front' | 'left';
  /** resizeTo 适配的 dom id 或元素引用 */
  resizeTo?: string | HTMLElement | Window;
  /** 分辨率 */
  resolution?: number;
  /** 保留绘制缓存数据，用来截图 */
  preserveDrawingBuffer?: boolean;
  /** resizeFramebuffer */
  resizeFramebuffer?: boolean;
  /** 颜色输出模式 renderer.outputEncoding */
  outputEncoding?: number;
  /** 最大帧率限制 */
  maxFPS?: number;
  /** 禁用 resize */
  disableResize?: boolean;
  /** 渲染标志（用来打开或关闭渲染 ticker，若为 false，则当前帧不渲染） */
  renderFlag?: boolean;
  /** 场景初始化完成的回调 */
  initialized?: (sceneTool: SceneTool) => void;
}

export interface ViewInfo {
  position: Vec2 | Vec3;
  scale: Vec2 | Vec3;
  visible: boolean;
  width?: number;
  height?: number;
}

export interface SceneContext {
  getCommandManager: () => CommandManager | undefined;
  getSceneTools: () => SceneTool;
}

export abstract class BaseScene<
  ApplicationContext,
  Scene,
  Camera,
  Raycaster,
  Container,
  DisplayObject,
  Viewport
> extends Component<BaseSceneProps> {
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

  tickers: Function[] = [];

  width: number = BaseScene.DEFAULT_WIDTH;

  height: number = BaseScene.DEFAULT_HEIGHT;

  coordinate: CoordinateController;

  mountTimer: number;

  sceneContext: SceneContext;

  resolution: number;

  backgroundImage: DisplayObject;

  maxFPS: number;

  renderFlag = true;

  constructor(props: Exclude<ComponentProps<BaseSceneProps>, ViewEntity>) {
    super(props);
    this.maxFPS = this.props.maxFPS || 60;
    if (this.props.viewport) {
      this.resolution = this.props.viewport.resolution || window.devicePixelRatio;
    } else {
      this.resolution = this.props.resolution || window.devicePixelRatio;
    }
    this.updateRenderFlag(this.props.renderFlag);
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
    this.sceneContext = {
      getCommandManager: () => this.props.commandMgr,
      getSceneTools: this.getSceneTools,
    };
  }

  componentDidMount() {
    this.mountCanvas();
    this.props.initialized && this.props.initialized(this.getSceneTools());
  }

  componentDidUpdate() {
    const { viewport, disableResize = false, renderFlag = true } = this.props;
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    this.updateRenderFlag(renderFlag);
    this.setBackGroundImage(app);
    if (this.sceneType === SceneType.Scene3D) {
      this.updateCameraInfo();
    }
    if (!viewport) {
      this.resolution = this.props.resolution || window.devicePixelRatio;
      this.updateResolution(app);
      !disableResize && this.resizeStageByCanvas(app);
      return;
    }
    const ctrl = this.getCurrentInteractiveController();
    if (ctrl) {
      ctrl.updateViewportInfo(viewport);
    }
    this.resolution = viewport.resolution || window.devicePixelRatio;
    this.updateResolution(app);
    !disableResize && this.resizeStageByCanvas(app);
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
  abstract getViewInfo(): ViewInfo;

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
    interactiveType: InteractiveType
  ) => {
    /** event 的直接对象 */
    originalTarget?: DisplayObject;
    /** originalTarget 或 originalTarget 的祖先中的第一个可被交互的元素 */
    target?: DisplayObject;
    /** 选中对象的具体场景鼠标位置 */
    originalTargetPoint?: Vec2 | Vec3;
  };

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
        onDBClick: this.onDBClick,
        onRightClick: this.onRightClick,
        onDragStart: this.onDragStart,
        onDragMove: this.onDragMove,
        onDragEnd: this.onDragEnd,
        onPinchStart: this.onPinchStart,
        onPinch: this.onPinch,
        onPinchEnd: this.onPinchEnd,
        onRotateStart: this.onRotateStart,
        onRotate: this.onRotate,
        onRotateEnd: this.onRotateEnd,
        onPress: this.onPress,
        onPressUp: this.onPressUp,
        onPointerMove: this.onPointerMove,
        onPointerUp: this.onPointerUp,
        onWheel: this.onWheel,
      },
      getCoordinateCtrl: this.getCoordinateCtrl,
      getHitTargetOriginal: this.getHitTargetOriginal(),
      maxFPS: this.maxFPS,
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

  /** 更新渲染状态 */
  private updateRenderFlag(flag = true) {
    this.renderFlag = flag;
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

  private updateCursorHandler = (cursor = 'inherit') => {
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    this.updateCursor(app, cursor);
  };

  abstract updateCursor(app: ApplicationContext, cursor: string): void;

  private getSceneTools = () => {
    const ctrl = this.getCurrentInteractiveController();
    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      updateInteractiveObject: ctrl ? ctrl.updateInteractiveObject : () => {},
      updateCursor: this.updateCursorHandler,
      hitTarget: ctrl ? ctrl.hitTarget : ((() => {}) as (point: Vec2) => undefined),
      coordinateTransform: this.coordinateTransform,
      getCamera: () => this.camera,
      getRaycaster: () => this.raycaster,
      getScene: () => this.scene,
      getRootView: () => this.view,
      getScreenShot: (
        sx?: number,
        sy?: number,
        w?: number,
        h?: number,
        fileType?: string,
        quality?: number,
        isBase64?: boolean
      ) => this.getScreenShot(sx, sy, w, h, fileType, quality, isBase64),
      getApp: () => this.getCurrentApp(),
      addTicker: (ticker: () => void) => {
        this.tickers.push(ticker);
      },
      removeTicker: (ticker: () => void) => {
        remove(this.tickers, ticker);
      },
    };
  };

  /**
   * 坐标转化
   */
  private coordinateTransform = (point: Vec2, type: CoordinateType, z?: number) => (this.coordinate ? this.coordinate.transform(point, type, z) : { x: 0, y: 0 });

  /**
   * 挂在画布到容器上
   */
  private mountCanvas = () => {
    const { container } = this.props;
    const el = typeof container === 'string' ? document.getElementById(container) : container;
    // 如果容器 DOM 没有准备好，留到下一帧再检测
    if (!el) {
      this.mountTimer = requestAnimationFrame(this.mountCanvas);
      return;
    }
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    // 挂载
    if (!BaseScene.appMountedStatus.has(container)) {
      BaseScene.appMountedStatus.set(container, true);
      if (window.$$turbox_hot) {
        el.innerHTML = '';
      }
      el.appendChild(this.getCanvasView(app));
    }
    // 根据容器大小确定画布大小
    this.resizeStageByCanvas(app);
    // 初始化背景图
    this.setBackGroundImage(app);
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
    const { cameraPosition } = this.props;
    this.updateCameraPosition({
      x: cameraPosition?.x || 0,
      y: cameraPosition?.y || 0,
      z: (cameraPosition as Vec3)?.z || 0,
    });
  }

  /** 更新相机位置 */
  abstract updateCameraPosition(position: Vec3): void;

  private resizeHandler = () => {
    const { disableResize = false } = this.props;
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    !disableResize && this.resizeStageByCanvas(app);
  };

  /** 初始化坐标系控制系统 */
  abstract createCoordinateController(app: ApplicationContext): CoordinateController;

  private resizeStageByCanvas(app: ApplicationContext) {
    const { viewport, coordinateType } = this.props;
    if (viewport) {
      this.resizeViewport(app);
    }
    this.resizeStage(app);
    this.width = this.getCanvasView(app).width / this.resolution;
    this.height = this.getCanvasView(app).height / this.resolution;
    if (this.sceneType === SceneType.Scene2D && coordinateType) {
      this.compute2dOriginView();
    }
  }

  /** 初始化天空盒 */
  abstract initSkyBox(app: ApplicationContext): void;

  /**
   * resize 场景大小
   */
  abstract resizeStage(app: ApplicationContext): void;

  /** 设置背景图 */
  abstract setBackGroundImage(app: ApplicationContext): void;

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
    if (
      viewportInfo &&
      viewportInfo.width &&
      viewportInfo.width > 0 &&
      viewportInfo.height &&
      viewportInfo.height > 0
    ) {
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
    this.addRootViewContainer(app);
  }

  /** 添加根视图容器到 app stage 的实现 */
  abstract addRootViewContainer(app: ApplicationContext): void;

  onClick = (event: SceneEvent) => {
    const { onClickNothing, commandMgr } = this.props;
    if (onClickNothing) {
      onClickNothing(event);
    }
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onClick, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onDBClick = (event: SceneEvent) => {
    const { onClickNothing, commandMgr } = this.props;
    if (onClickNothing) {
      onClickNothing(event);
    }
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onDBClick, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onRightClick = (event: SceneEvent) => {
    const { onClickNothing, commandMgr } = this.props;
    if (onClickNothing) {
      onClickNothing(event);
    }
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onRightClick, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onDragStart = (event: SceneEvent) => {
    const { draggable = true, commandMgr } = this.props;
    if (draggable) {
      this.canvasDragImpl(event, 'start');
    }
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onDragStart, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onDragMove = (event: SceneEvent) => {
    const { draggable = true, commandMgr } = this.props;
    if (draggable) {
      this.canvasDragImpl(event, 'move');
    }
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onDragMove, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onDragEnd = (event: SceneEvent) => {
    const { draggable = true, commandMgr } = this.props;
    if (draggable) {
      this.canvasDragImpl(event, 'end');
    }
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onDragEnd, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onPinchStart = (event: SceneEvent) => {
    const { commandMgr } = this.props;
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onPinchStart, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onPinch = (event: SceneEvent) => {
    const { scalable = true, commandMgr } = this.props;
    if (scalable) {
      this.canvasScaleImpl(event);
    }
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onPinch, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onPinchEnd = (event: SceneEvent) => {
    const { commandMgr } = this.props;
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onPinchEnd, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onRotateStart = (event: SceneEvent) => {
    const { commandMgr } = this.props;
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onRotateStart, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onRotate = (event: SceneEvent) => {
    const { commandMgr } = this.props;
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onRotate, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onRotateEnd = (event: SceneEvent) => {
    const { commandMgr } = this.props;
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onRotateEnd, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onPress = (event: SceneEvent) => {
    const { commandMgr } = this.props;
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onPress, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onPressUp = (event: SceneEvent) => {
    const { commandMgr } = this.props;
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onPressUp, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onPointerMove = (event: SceneEvent) => {
    const { commandMgr } = this.props;
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onCarriageMove, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onPointerUp = (event: SceneEvent) => {
    const { commandMgr } = this.props;
    if (commandMgr) {
      commandMgr.distributeEvent(EventType.onCarriageEnd, this.getViewEntity(), event, this.getSceneTools());
    }
  };

  onWheel = (event: WheelEvent) => {
    const { scalable = true, commandMgr } = this.props;
    if (scalable) {
      this.canvasScaleImpl(event);
    }
    const ctrl = this.getCurrentInteractiveController();
    if (commandMgr && ctrl) {
      commandMgr.distributeEvent(
        EventType.onWheel,
        this.getViewEntity(),
        SceneEvent.create(event, this.getCoordinateCtrl, ctrl.hitTargetOriginalByPoint),
        this.getSceneTools()
      );
    }
  };

  /** 画布拖拽功能的实现，注意：如果已经引入其他交互插件则无需重复实现，避免实现上的冲突 */
  abstract canvasDragImpl(event: SceneEvent, type: 'start' | 'move' | 'end'): void;

  /** 画布缩放功能的实现，注意：如果已经引入其他交互插件则无需重复实现，避免实现上的冲突 */
  abstract canvasScaleImpl(event: WheelEvent | SceneEvent): void;

  /** 获取视口的实现 */
  abstract getViewport(): Viewport | undefined;

  /** 获取视口基础信息的实现 */
  abstract getViewportInfo(): ViewInfo | undefined;

  /** 初始化视口，给 viewport 设值 */
  abstract createViewport(): void;

  /** 设置视口的位置 */
  abstract setViewportPosition(position: Partial<Vec3>): void;

  /** 设置视口的缩放 */
  abstract setViewportScale(scale: Partial<Vec3>): void;

  /** 设置视口是否可见 */
  abstract setViewportVisible(visible: boolean): void;

  /** 获取截图 */
  abstract getScreenShot(
    sx?: number,
    sy?: number,
    w?: number,
    h?: number,
    fileType?: string,
    quality?: number,
    isBase64?: boolean
  ): Promise<string | Blob>;
}
