/* eslint-disable @typescript-eslint/member-ordering */
import { CoordinateController, InteractiveConfig, InteractiveType, SceneMouseEvent } from '@turbox3d/event-manager';
import { BaseScene, BaseSceneProps, SceneType } from '@turbox3d/graphic-view';
import { Vec2, Vec3 } from '@turbox3d/shared';
import * as PIXI from 'pixi.js';
import React from 'react';
import { Scene2dContext } from './context';

const interactiveMgr = new PIXI.InteractionManager({} as any);
export const Scene2DSymbol = Symbol('scene2d');

class CoordinateControllerPixi extends CoordinateController {
  scene2d: Scene2D;

  constructor(canvas: HTMLCanvasElement, scene: Scene2D) {
    super(canvas);
    this.scene2d = scene;
  }

  canvasToSceneImpl(point: Vec2) {
    const { x, y } = this.scene2d.view.position;
    let scale = this.scene2d.view.scale.x;
    if (this.scene2d.props.coordinateType && (this.scene2d.props.coordinateType === 'front' || this.scene2d.props.coordinateType === 'left')) {
      scale = -scale;
    }
    let newX = (point.x - x) / this.scene2d.view.scale.x;
    let newY = (point.y - y) / scale;
    if (this.scene2d.props.viewport) {
      newX = (point.x - this.scene2d.props.viewport.x - x) / this.scene2d.view.scale.x;
      newY = (point.y - this.scene2d.props.viewport.y - y) / scale;
    }
    return {
      x: newX,
      y: newY,
    };
  }

  sceneToCanvasImpl(point: Vec2) {
    const { x, y } = this.scene2d.view.position;
    let scale = this.scene2d.view.scale.x;
    if (this.scene2d.props.coordinateType && (this.scene2d.props.coordinateType === 'front' || this.scene2d.props.coordinateType === 'left')) {
      scale = -scale;
    }
    let newX = point.x * this.scene2d.view.scale.x + x;
    let newY = point.y * scale + y;
    if (this.scene2d.props.viewport) {
      newX = point.x * this.scene2d.view.scale.x + x + this.scene2d.props.viewport.x;
      newY = point.y * scale + y + this.scene2d.props.viewport.y;
    }
    return {
      x: newX,
      y: newY,
    };
  }
}

export class Scene2D extends BaseScene<PIXI.Application, PIXI.Container, PIXI.DisplayObject, PIXI.Sprite> {
  defaultSceneViewType = Scene2DSymbol;

  sceneType = SceneType.Scene2D;

  private offsetCenter: Vec2 = { x: 0, y: 0 };

  private brt?: PIXI.BaseRenderTexture;

  private rt?: PIXI.RenderTexture;

  private originalResizeFramebufferFunction: Function;

  constructor(props: BaseSceneProps) {
    super(props);
    this.view.sortableChildren = true;
  }

  render() {
    if (!Scene2dContext) {
      return null;
    }

    return (
      <Scene2dContext.Provider value={this.sceneContext}>
        {this.props.children}
      </Scene2dContext.Provider>
    );
  }

  createView() {
    return new PIXI.Container();
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
        if (this.viewport?.visible) {
          app.renderer.render(this.view, this.rt);
          app.renderer.framebuffer.blit();
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
    const { backgroundColor = BaseScene.BACKGROUND_COLOR, transparent = BaseScene.TRANSPARENT, width = BaseScene.DEFAULT_WIDTH, height = BaseScene.DEFAULT_HEIGHT, resizeTo, allowUseData = false, resizeFramebuffer } = this.props;
    const resizeContainer = typeof resizeTo === 'string' ? document.getElementById(resizeTo) : resizeTo;
    // 初始化应用
    const app = new PIXI.Application({
      width,
      height,
      backgroundColor,
      transparent,
      antialias: true,
      autoDensity: true,
      resolution: this.resolution,
      resizeTo: resizeContainer || window,
      preserveDrawingBuffer: allowUseData,
    });
    // 暂存原始 resizeFramebuffer 函数
    this.originalResizeFramebufferFunction = (app.renderer.framebuffer as any).resizeFramebuffer;
    // this.fixResizeFramebufferBug(app, resizeFramebuffer);
    return app;
  }

  /**
   * 修复 PIXI bug，改写 resizeFramebuffer，解决 pixi frame buffer 只能由大变小但不能由小变大 resize 的问题
   * 因为修复此 bug 会导致性能问题，所以只在必要的时候使用，通过参数控制改写的内容
   */
  private fixResizeFramebufferBug(app: PIXI.Application, resizeFramebuffer = false) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    if (resizeFramebuffer) {
      (app.renderer.framebuffer as any).resizeFramebuffer = function (framebuffer: any) {
        _this.originalResizeFramebufferFunction.call(this, framebuffer);
        this.updateFramebuffer(framebuffer);
      };
    } else {
      (app.renderer.framebuffer as any).resizeFramebuffer = function (framebuffer: any) {
        _this.originalResizeFramebufferFunction.call(this, framebuffer);
      };
    }
  }

  /**
   * 停止内置的 InteractionManager
   * @param PixiWorld 的 renderer
   */
  destroyRendererInteraction(app: PIXI.Application) {
    if (app.renderer.plugins && app.renderer.plugins.interaction && app.renderer.plugins.interaction.destroy) {
      app.renderer.plugins.interaction.destroy();
    }
  }

  addChildView(view: PIXI.DisplayObject) {
    this.view.addChild(view);
  }

  getCanvasView(app: PIXI.Application) {
    return app.view;
  }

  getHitTargetOriginal() {
    return (
      point: Vec2,
      container: PIXI.Container,
      configMap: Map<PIXI.DisplayObject, InteractiveConfig>,
      interactiveType: InteractiveType,
    ) => {
      const originalTarget = interactiveMgr.hitTest(new PIXI.Point(point.x, point.y), container);
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
    this.getCanvasView(app).style.cursor = cursor;
  };

  createCoordinateController(app: PIXI.Application) {
    return new CoordinateControllerPixi(this.getCanvasView(app), this);
  }

  resizeStage = (app: PIXI.Application) => {
    app.resize();
  };

  initBackGroundImage(app: PIXI.Application) {
    const { width, height, props: { backgroundImage } } = this;
    if (backgroundImage) {
      const image = PIXI.Sprite.from(backgroundImage);
      image.width = width;
      image.height = height;
      app.stage.addChild(image);
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
    // this.fixResizeFramebufferBug(app, resizeFramebuffer);
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
  getScreenShot(): string {
    if (this.view.scale.y > 0) {
      this.view.position.set(0, 0);
      this.view.scale.set(1, 1);
    } else {
      this.view.position.set(0, this.view.getLocalBounds().height);
      this.view.scale.set(1, -1);
    }
    const app = this.getCurrentApp();
    if (!app) {
      return '';
    }
    return app.renderer.plugins.extract.base64(this.view, 'image/jpeg');
  }

  canvasScaleImpl(event: WheelEvent) {
    const { coordinateType } = this.props;
    const ratio = event.deltaY > 0 ? BaseScene.SCALE_SMALLER : BaseScene.SCALE_BIGGER;
    const currentScale = this.getViewInfo().scale.x;

    if (coordinateType === 'front' || coordinateType === 'left') {
      this.setViewScale({ x: currentScale * ratio, y: -currentScale * ratio });
    } else {
      this.setViewScale({ x: currentScale * ratio, y: currentScale * ratio });
    }

    let { offsetX, offsetY } = event;
    const vpi = this.getViewportInfo();
    if (vpi) {
      offsetX -= vpi.position.x;
      offsetY -= vpi.position.y;
    }
    const { x, y } = this.getViewInfo().position;
    this.setViewPosition({ x: offsetX + (x - offsetX) * ratio, y: offsetY + (y - offsetY) * ratio });
  }

  canvasDragImpl(event: SceneMouseEvent, type: 'start' | 'move' | 'end') {
    if (type === 'start') {
      const { x: offsetX, y: offsetY } = event.layerPosition;
      const { x, y } = this.getViewInfo().position;
      this.offsetCenter = {
        x: x - offsetX,
        y: y - offsetY,
      };
    } else if (type === 'move') {
      const { x, y } = event.layerPosition;
      this.setViewPosition({ x: this.offsetCenter.x + x, y: this.offsetCenter.y + y });
    }
  }
}
