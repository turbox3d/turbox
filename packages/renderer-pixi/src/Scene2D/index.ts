import { CoordinateController, InteractiveConfig, InteractiveType, SceneEvent, ViewEntity } from '@turbox3d/event-manager';
import { BaseScene, BaseSceneProps, ComponentProps, SceneType } from '@turbox3d/renderer-core';
import { Vec2, Vec3 } from '@turbox3d/shared';
import * as PIXI from 'pixi.js';

const boundary = new PIXI.EventBoundary();

export const Scene2DSymbol = Symbol('scene2d');

export class Scene2D extends BaseScene<PIXI.Application, PIXI.ICanvas, never, never, never, PIXI.Container, PIXI.DisplayObject, PIXI.Sprite> {
  defaultSceneViewType = Scene2DSymbol;

  sceneType = SceneType.Scene2D;

  private offsetCenter: Vec2 = { x: 0, y: 0 };

  private brt?: PIXI.BaseRenderTexture;

  private rt?: PIXI.RenderTexture;

  private originalResizeFramebufferFunction: Function;

  constructor(props: Exclude<ComponentProps<BaseSceneProps>, ViewEntity>) {
    super(props);
    this.view.sortableChildren = true;
  }

  componentDidUpdate() {
    super.componentDidUpdate();
    const app = this.getCurrentApp();
    if (!app) {
      return;
    }
    if (this.renderFlag) {
      app.start();
    } else {
      app.stop();
    }
  }

  createView() {
    const view = new PIXI.Container();
    view.name = Scene2DSymbol.toString();
    view.sortableChildren = true;
    return view;
  }

  getViewInfo() {
    return {
      position: { x: this.view.position.x, y: this.view.position.y },
      scale: { x: this.view.scale.x, y: this.view.scale.y },
      visible: this.view.visible,
    };
  }

  setViewPosition(position: Partial<Vec3>) {
    if (position.x !== void 0) {
      this.view.position.x = position.x;
    }
    if (position.y !== void 0) {
      this.view.position.y = position.y;
    }
  }

  setViewScale(scale: Partial<Vec3>) {
    if (scale.x !== void 0) {
      this.view.scale.x = scale.x;
    }
    if (scale.y !== void 0) {
      this.view.scale.y = scale.y;
    }
  }

  setViewVisible(visible: boolean) {
    this.view.visible = visible;
  }

  setViewportPosition(position: Partial<Vec3>) {
    if (!this.viewport) {
      return;
    }
    if (position.x !== void 0) {
      this.viewport.position.x = position.x;
    }
    if (position.y !== void 0) {
      this.viewport.position.y = position.y;
    }
  }

  setViewportScale(scale: Partial<Vec3>) {
    if (!this.viewport) {
      return;
    }
    if (scale.x !== void 0) {
      this.viewport.scale.x = scale.x;
    }
    if (scale.y !== void 0) {
      this.viewport.scale.y = scale.y;
    }
  }

  setViewportVisible(visible: boolean) {
    if (!this.viewport) {
      return;
    }
    this.viewport.visible = visible;
  }

  addRootViewContainer(app: PIXI.Application) {
    const { viewport } = this.props;
    if (viewport) {
      // 创建视口，用精灵展示显示内容
      this.createViewport();
      const vp = this.getViewport();
      if (vp) {
        vp.position.x = viewport.x;
        vp.position.y = viewport.y;
        vp.visible = viewport.visible;
        app.stage.addChild(vp);
      }
      app.ticker.add(() => {
        if (this.viewport?.visible && this.renderFlag) {
          app.renderer.render(this.view, {
            renderTexture: this.rt,
          });
          if (this.isWebGL(app) && (app.renderer as PIXI.Renderer).framebuffer) {
            (app.renderer as PIXI.Renderer).framebuffer.blit();
          }
        }
      });
    } else {
      app.stage.addChild(this.view);
    }
  }

  createViewport() {
    const { viewport } = this.props;
    if (!viewport) {
      return;
    }
    // 根据传入的视口信息与计算好的原始视图数据生成 frame buffer 数据
    this.brt = new PIXI.BaseRenderTexture({
      width: viewport.width,
      height: viewport.height,
      resolution: this.resolution,
    });
    this.rt = new PIXI.RenderTexture(this.brt);
    this.rt.framebuffer.multisample = PIXI.MSAA_QUALITY.HIGH;
    if (viewport) {
      this.viewport = new PIXI.Sprite(this.rt);
    }
  }

  getViewport() {
    return this.viewport;
  }

  getViewportInfo() {
    if (!this.viewport) {
      return;
    }
    return {
      position: { x: this.viewport.position.x, y: this.viewport.position.y },
      scale: { x: this.viewport.scale.x, y: this.viewport.scale.y },
      visible: this.viewport.visible,
      width: this.viewport.width,
      height: this.viewport.height,
    };
  }

  createApp() {
    const { backgroundColor = BaseScene.BACKGROUND_COLOR, backgroundAlpha = BaseScene.BACKGROUND_ALPHA, preserveDrawingBuffer = true, resizeFramebuffer } = this.props;
    // 初始化应用
    const app = new PIXI.Application({
      width: this.width,
      height: this.height,
      backgroundColor,
      backgroundAlpha,
      antialias: true,
      autoDensity: true,
      resolution: this.resolution,
      preserveDrawingBuffer,
    });
    app.ticker.deltaMS = 1000 / this.maxFPS;
    if (this.isWebGL(app)) {
      // 暂存原始 resizeFramebuffer 函数
      this.originalResizeFramebufferFunction = (app.renderer as PIXI.Renderer).framebuffer.resizeFramebuffer;
      // this.fixResizeFramebufferBug(app, resizeFramebuffer);
    }
    if (this.renderFlag) {
      app.start();
    } else {
      app.stop();
    }
    return app;
  }

  updateCameraTarget() {
    //
  }

  updateCameraPosition() {
    //
  }

  /**
   * 修复 PIXI bug，改写 resizeFramebuffer，解决 pixi frame buffer 只能由大变小但不能由小变大 resize 的问题
   * 因为修复此 bug 会导致性能问题，所以只在必要的时候使用，通过参数控制改写的内容
   */
  private fixResizeFramebufferBug(app: PIXI.Application, resizeFramebuffer = false) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    if (resizeFramebuffer) {
      (app.renderer as PIXI.Renderer).framebuffer.resizeFramebuffer = function (framebuffer) {
        _this.originalResizeFramebufferFunction.call(this, framebuffer);
        this.updateFramebuffer(framebuffer);
      };
    } else {
      (app.renderer as PIXI.Renderer).framebuffer.resizeFramebuffer = function (framebuffer) {
        _this.originalResizeFramebufferFunction.call(this, framebuffer);
      };
    }
  }

  private isWebGL(app: PIXI.Application) {
    return app.renderer.type === PIXI.RENDERER_TYPE.WEBGL;
  }

  destroyRendererInteraction(app: PIXI.Application) {
    app.renderer.events.destroy();
  }

  addChildView(view: PIXI.DisplayObject) {
    this.view.addChild(view);
  }

  getCanvasView(app: PIXI.Application) {
    const canvas = app.view;
    return {
      width: canvas.width,
      height: canvas.height,
      renderer: canvas,
    };
  }

  unmountCanvas() {
    //
  }

  mountCanvas() {
    //
  }

  getHitTargetOriginal() {
    return (
      point: Vec2,
      container: PIXI.Container,
      configMap: Map<PIXI.DisplayObject, InteractiveConfig>,
      interactiveType: InteractiveType,
    ) => {
      boundary.rootTarget = container;
      const originalTarget = boundary.hitTest(point.x, point.y);
      let hitTarget: PIXI.DisplayObject | undefined;

      for (let target = originalTarget; target && target !== container; target = target.parent) {
        const config = configMap.get(target);
        if (config && config[interactiveType]) {
          hitTarget = target;
          break;
        }
      }
      return { originalTarget, target: hitTarget };
    };
  }

  updateCursor = (app: PIXI.Application, cursor: string) => {
    const canvas = this.getCanvasView(app).renderer;
    if (canvas.style) {
      canvas.style.cursor = cursor;
    }
  };

  createCoordinateController(app: PIXI.Application) {
    const renderer = this.getCanvasView(app).renderer as HTMLCanvasElement;
    return new CoordinateController({
      getCanvasRectImpl: () => renderer.getBoundingClientRect(),
      canvasToSceneImpl: (point: Vec2) => {
        const { x, y } = this.view.position;
        let scale = this.view.scale.x;
        if (this.props.coordinateType && (this.props.coordinateType === 'front' || this.props.coordinateType === 'left')) {
          scale = -scale;
        }
        let newX = (point.x - x) / this.view.scale.x;
        let newY = (point.y - y) / scale;
        if (this.props.viewport) {
          newX = (point.x - this.props.viewport.x - x) / this.view.scale.x;
          newY = (point.y - this.props.viewport.y - y) / scale;
        }
        return {
          x: newX,
          y: newY,
        };
      },
      sceneToCanvasImpl: (point: Vec2) => {
        const { x, y } = this.view.position;
        let scale = this.view.scale.x;
        if (this.props.coordinateType && (this.props.coordinateType === 'front' || this.props.coordinateType === 'left')) {
          scale = -scale;
        }
        let newX = point.x * this.view.scale.x + x;
        let newY = point.y * scale + y;
        if (this.props.viewport) {
          newX = point.x * this.view.scale.x + x + this.props.viewport.x;
          newY = point.y * scale + y + this.props.viewport.y;
        }
        return {
          x: newX,
          y: newY,
        };
      },
    });
  }

  resizeStage = (app: PIXI.Application) => {
    const { resizeTo } = this.props;
    const resizeContainer = typeof resizeTo === 'string' ? document.getElementById(resizeTo) : resizeTo;
    app.resizeTo = resizeContainer || window;
    app.resize();
  };

  setBackGroundImage(app: PIXI.Application) {
    const { width, height, props: { backgroundImage } } = this;
    this.backgroundImage && app.stage.removeChild(this.backgroundImage);
    if (backgroundImage) {
      const image = PIXI.Sprite.from(backgroundImage);
      this.backgroundImage = image;
      image.width = width;
      image.height = height;
      app.stage.addChildAt(image, 0);
    }
  }

  initSkyBox() {
    //
  }

  updateResolution(app: PIXI.Application) {
    const { viewport } = this.props;
    if (this.brt && viewport) {
      this.brt.setResolution(this.resolution);
    } else {
      app.renderer.resolution = this.resolution;
    }
  }

  resizeViewport(app: PIXI.Application) {
    const { viewport, resizeFramebuffer } = this.props;
    if (this.isWebGL(app)) {
      // this.fixResizeFramebufferBug(app, resizeFramebuffer);
    }
    if (this.brt && viewport) {
      this.brt.resize(viewport.width, viewport.height);
    }
  }

  destroyApp(app: PIXI.Application) {
    // 每一个子组件都会通过 componentWillUnmount 调用自己的 destroy 方法，所以这里的 children 设置为 false
    app.destroy(true, { children: false, texture: true, baseTexture: true });
  }

  removeAppChildrenView(app: PIXI.Application) {
    app.stage.removeChildren();
  }

  /** 获取截图 */
  async getScreenShot(sx = 0, sy = 0, w?: number, h?: number, fileType = 'image/png', quality = 1, isBase64 = true) {
    const app = this.getCurrentApp();
    if (!app) {
      return '';
    }
    const oldCanvas = app.view as HTMLCanvasElement;
    const newCanvas = document.createElement('canvas');
    const width = w || oldCanvas.width;
    const height = h || oldCanvas.height;
    newCanvas.width = width;
    newCanvas.height = height;
    const newContext = newCanvas.getContext('2d');
    if (!newContext) {
      return '';
    }
    newContext.drawImage(oldCanvas, sx, sy, width, height, 0, 0, width, height);
    return new Promise<string | Blob>((resolve) => {
      if (isBase64) {
        const imgData = newCanvas.toDataURL(fileType, quality);
        resolve(imgData);
      } else {
        newCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          }
        }, fileType, quality);
      }
    });
  }

  canvasScaleImpl(event: SceneEvent) {
    const { coordinateType } = this.props;
    let ratio = 1;
    let offsetX = 0;
    let offsetY = 0;
    if (event.event instanceof WheelEvent) {
      ratio = event.event.deltaY > 0 ? BaseScene.SCALE_SMALLER : BaseScene.SCALE_BIGGER;
      offsetX = event.event.offsetX;
      offsetY = event.event.offsetY;
    } else {
      ratio = (event.extra as any)?.deltaScale || 1;
      offsetX = event.event.clientX;
      offsetY = event.event.clientY;
    }
    const currentScale = this.getViewInfo().scale.x;
    if (coordinateType === 'front' || coordinateType === 'left') {
      this.setViewScale({ x: currentScale * ratio, y: -currentScale * ratio });
    } else {
      this.setViewScale({ x: currentScale * ratio, y: currentScale * ratio });
    }
    const vpi = this.getViewportInfo();
    if (vpi) {
      offsetX -= vpi.position.x;
      offsetY -= vpi.position.y;
    }
    const { x, y } = this.getViewInfo().position;
    this.setViewPosition({ x: offsetX + (x - offsetX) * ratio, y: offsetY + (y - offsetY) * ratio });
  }

  canvasDragImpl(event: SceneEvent, type: 'start' | 'move' | 'end') {
    if (type === 'start') {
      const { x: offsetX, y: offsetY } = event.canvasPosition;
      const { x, y } = this.getViewInfo().position;
      this.offsetCenter = {
        x: x - offsetX,
        y: y - offsetY,
      };
    } else if (type === 'move') {
      const { x, y } = event.canvasPosition;
      this.setViewPosition({ x: this.offsetCenter.x + x, y: this.offsetCenter.y + y });
    }
  }
}
