/* eslint-disable @typescript-eslint/member-ordering */
import * as THREE from 'three';
import { InteractiveConfig, InteractiveType, CoordinateController, IViewEntity } from '@turbox3d/event-manager';
import { BaseScene, SceneType, ComponentProps, BaseSceneProps } from '@turbox3d/renderer-core';
import { Vec2, Vec3 } from '@turbox3d/shared';

export const Scene3DSymbol = Symbol('scene3d');

class CoordinateControllerThree extends CoordinateController {
  scene3d: Scene3D;

  constructor(canvas: HTMLCanvasElement, scene: Scene3D) {
    super(canvas);
    this.scene3d = scene;
  }

  canvasToSceneImpl(point: Vec2, z?: number) {
    const app = this.scene3d.getCurrentApp();
    const ctrl = this.scene3d.getCurrentInteractiveController();
    if (!app || !ctrl) {
      return {
        x: 0,
        y: 0,
        z: 0,
      };
    }
    if (z !== void 0) {
      const camera = this.scene3d.camera!;
      const pX = (point.x / app.domElement.clientWidth) * 2 - 1;
      const pY = -(point.y / app.domElement.clientHeight) * 2 + 1;
      const v = new THREE.Vector3(pX, pY, 0.5);
      const pos = new THREE.Vector3();
      v.unproject(camera);
      if (camera instanceof THREE.OrthographicCamera) {
        v.applyMatrix4(this.scene3d.view.matrixWorld.clone().invert());
        pos.copy(v);
      } else if (camera instanceof THREE.PerspectiveCamera) {
        v.sub(camera.position).normalize();
        const distance = (z - camera.position.z) / v.z;
        pos.copy(camera.position).add(v.multiplyScalar(distance));
        pos.applyMatrix4(this.scene3d.view.matrixWorld.clone().invert());
      }
      return {
        x: pos.x,
        y: pos.y,
        z,
      };
    }
    // 射线穿中的就用穿中的目标点，如果没有就需要指定一个 z，因为升维无法确定 z 的值
    const p = ctrl.hitTargetOriginalByPoint(point).originalTargetPoint as Vec3 | undefined;
    return p || {
      x: 0,
      y: 0,
      z: 0,
    };
  }

  sceneToCanvasImpl(point: Vec3) {
    const v = new THREE.Vector3(point.x, point.y, point.z);
    v.applyMatrix4(this.scene3d.view.matrixWorld);
    v.project(this.scene3d.camera!);
    const app = this.scene3d.getCurrentApp();
    if (!app) {
      return {
        x: 0,
        y: 0,
      };
    }
    const halfWidth = app.domElement.clientWidth / 2;
    const halfHeight = app.domElement.clientHeight / 2;
    return {
      x: Math.round(v.x * halfWidth + halfWidth),
      y: Math.round(-v.y * halfHeight + halfHeight),
    };
  }
}

export class Scene3D extends BaseScene<THREE.WebGLRenderer, THREE.Scene, THREE.Camera, THREE.Raycaster, THREE.Group, THREE.Object3D, THREE.Sprite> {
  defaultSceneViewType = Scene3DSymbol;
  sceneType = SceneType.Scene3D;
  raycaster = new THREE.Raycaster();
  private timer: number;

  // eslint-disable-next-line no-useless-constructor
  constructor(props: Exclude<ComponentProps<BaseSceneProps>, IViewEntity>) {
    super(props);
  }

  createView() {
    const view = new THREE.Group();
    view.name = Scene3DSymbol.toString();
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
    // if (!this.viewport) {
    //   return;
    // }
    // if (position.x !== void 0) {
    //   this.viewport.position.x = position.x;
    // }
    // if (position.y !== void 0) {
    //   this.viewport.position.y = position.y;
    // }
  }

  setViewportScale(scale: Partial<Vec3>) {
    // if (!this.viewport) {
    //   return;
    // }
    // if (scale.x !== void 0) {
    //   this.viewport.scale.x = scale.x;
    // }
    // if (scale.y !== void 0) {
    //   this.viewport.scale.y = scale.y;
    // }
  }

  setViewportVisible(visible: boolean) {
    // if (!this.viewport) {
    //   return;
    // }
    // this.viewport.visible = visible;
  }

  createViewport() {
    //
  }

  destroyRendererInteraction() {
    //
  }

  getViewportInfo() {
    return undefined;
  }

  getViewport() {
    return undefined;
  }

  resizeViewport() {
    //
  }

  addRootViewContainer() {
    this.scene!.add(this.view);
  }

  createApp() {
    const { backgroundColor = BaseScene.BACKGROUND_COLOR, transparent = BaseScene.TRANSPARENT, cameraPosition, preserveDrawingBuffer = false } = this.props;
    // 初始化应用
    this.scene = new THREE.Scene();
    // 默认提供一个相机，可在检测到相机组件后替换掉
    this.camera = new THREE.PerspectiveCamera(60, this.width / this.height, 1, 30000);
    const app = new THREE.WebGLRenderer({
      alpha: transparent,
      antialias: true,
      preserveDrawingBuffer,
    });
    app.setPixelRatio(this.resolution);
    app.setSize(this.width, this.height);
    app.setClearColor(backgroundColor, transparent ? 0 : 1);
    if (this.props.outputEncoding) {
      app.outputEncoding = this.props.outputEncoding;
    }
    this.updateCameraPosition(cameraPosition as Vec3);
    const animate = () => {
      if (this.renderFlag) {
        this.tickers.forEach(ticker => ticker());
        app.render(this.scene!, this.camera!);
      }
      if (this.maxFPS === 60) {
        this.timer = requestAnimationFrame(animate);
      } else {
        this.timer = window.setTimeout(animate, 1000 / this.maxFPS);
      }
    };
    animate();
    return app;
  }

  updateCameraPosition(v: Vec3) {
    this.camera?.position.set(v.x || 0, v.y || 0, v.z || 0);
  }

  addChildView(view: THREE.Object3D) {
    this.view.add(view);
  }

  getCanvasView(app: THREE.WebGLRenderer) {
    return app.domElement;
  }

  getHitTargetOriginal() {
    return (
      point: Vec2,
      container: THREE.Group,
      configMap: Map<THREE.Object3D, InteractiveConfig>,
      interactiveType: InteractiveType,
    ) => {
      // calculate mouse position in normalized device coordinates
      // (-1 to +1) for both components
      const mouse = { x: 0, y: 0 };
      const app = this.getCurrentApp();
      if (!app) {
        return {
          originalTarget: undefined,
          target: undefined,
          originalTargetPoint: undefined,
        };
      }
      mouse.x = (point.x / app.domElement.clientWidth) * 2 - 1;
      mouse.y = -(point.y / app.domElement.clientHeight) * 2 + 1;
      this.raycaster.setFromCamera(mouse, this.camera!);
      const objects = this.raycaster.intersectObjects(this.scene!.children, true);
      let i = 0;
      if (!objects[0]) {
        return {
          originalTarget: undefined,
          target: undefined,
          originalTargetPoint: undefined,
        };
      }
      // 相同距离的需要再根据 renderOrder 排序
      const sameDisLength = objects.filter(o => o.distance.toFixed(10) === objects[0].distance.toFixed(10)).length;
      const sameDisObjects = objects.splice(0, sameDisLength);
      sameDisObjects.sort((a, b) => b.object.renderOrder - a.object.renderOrder);
      objects.unshift(...sameDisObjects);
      // 找到最近的一个可交互的对象
      const originalTarget = objects[i]; // closest first
      let obj = originalTarget.object;
      while (!obj.userData.interactive) {
        // 如果不可交互就找它的父节点，当整条路径都不可交互，则选择下一个被射线穿过的对象
        while (!obj.userData.interactive && obj.parent) {
          obj = obj.parent;
        }
        if (obj.userData.interactive) {
          break;
        }
        i += 1;
        const inter = objects[i];
        if (inter) {
          obj = inter.object;
        } else {
          obj = this.view;
          break;
        }
      }
      let hitTarget: THREE.Object3D | undefined;
      // 有可能只是其中一项可交互，如果当前 interactiveType 对应的值为 false，则向其父级节点冒泡
      for (let target = obj; target && target !== container; target = target.parent!) {
        const config = configMap.get(target);
        if (config && config[interactiveType]) {
          hitTarget = target;
          break;
        }
      }
      return {
        originalTarget: obj,
        target: hitTarget,
        originalTargetPoint: {
          x: originalTarget.point.x,
          y: originalTarget.point.y,
          z: originalTarget.point.z,
        },
      };
    };
  }

  updateCursor = (app: THREE.WebGLRenderer, cursor: string) => {
    this.getCanvasView(app).style.cursor = cursor;
  };

  createCoordinateController(app: THREE.WebGLRenderer) {
    return new CoordinateControllerThree(this.getCanvasView(app), this);
  }

  resizeStage = (app: THREE.WebGLRenderer) => {
    const { resizeTo } = this.props;
    const resizeContainer = typeof resizeTo === 'string' ? document.getElementById(resizeTo) : resizeTo;
    if (resizeContainer && !(resizeContainer instanceof Window)) {
      this.resizeStageBySize(app, resizeContainer.clientWidth, resizeContainer.clientHeight);
    } else {
      this.resizeStageBySize(app, window.innerWidth, window.innerHeight);
    }
  };

  private resizeStageBySize(app: THREE.WebGLRenderer, width: number, height: number) {
    const aspect = width / height;
    if (this.camera && this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = aspect;
      this.camera.updateProjectionMatrix();
    } else if (this.camera && this.camera instanceof THREE.OrthographicCamera) {
      const frustumSize = this.props.frustumSize || height;
      this.camera.left = -frustumSize * aspect / 2;
      this.camera.right = frustumSize * aspect / 2;
      this.camera.top = frustumSize / 2;
      this.camera.bottom = -frustumSize / 2;
      this.camera.updateProjectionMatrix();
    }
    app.setSize(width, height);
  }

  setBackGroundImage() {
    const { width, height, props: { backgroundImage } } = this;
    this.backgroundImage && this.scene!.remove(this.backgroundImage);
    if (backgroundImage) {
      const map = new THREE.TextureLoader().load(backgroundImage);
      const material = new THREE.SpriteMaterial({ map, color: 0xffffff });
      const image = new THREE.Sprite(material);
      this.backgroundImage = image;
      image.scale.set(width, height, 1);
      this.scene!.add(image);
    }
  }

  initSkyBox() {
    const { skyBoxImages } = this.props;
    if (skyBoxImages && skyBoxImages.length) {
      new THREE.CubeTextureLoader()
        .load(skyBoxImages, (texture) => {
          this.scene!.background = texture;
        });
    }
  }

  updateResolution(app: THREE.WebGLRenderer) {
    app.setPixelRatio(this.resolution);
  }

  destroyApp(app: THREE.WebGLRenderer) {
    app.dispose();
    if (this.maxFPS === 60) {
      cancelAnimationFrame(this.timer);
    } else {
      window.clearTimeout(this.timer);
    }
  }

  removeAppChildrenView() {
    this.scene!.clear();
  }

  /** 获取截图 */
  async getScreenShot(sx = 0, sy = 0, w?: number, h?: number, fileType = 'image/png', quality = 1, isBase64 = true) {
    const app = this.getCurrentApp();
    if (!app) {
      return '';
    }
    const oldCanvas = app.domElement;
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

  canvasScaleImpl() {
    //
  }

  canvasDragImpl() {
    //
  }
}
