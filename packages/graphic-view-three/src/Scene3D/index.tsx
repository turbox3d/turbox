/* eslint-disable @typescript-eslint/member-ordering */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import React from 'react';
import { InteractiveConfig, InteractiveType, CoordinateController } from '@turbox3d/event-manager';
import { BaseScene, SceneContext, SceneType } from '@turbox3d/graphic-view';
import { Vec2, Vec3 } from '@turbox3d/shared';
import { Scene3dContext } from './context';

export const Scene3DSymbol = Symbol('scene3d');

class CoordinateControllerThree extends CoordinateController {
  scene3d: Scene3D;

  constructor(canvas: HTMLCanvasElement, scene: Scene3D) {
    super(canvas);
    this.scene3d = scene;
  }

  canvasToSceneImpl(point: Vec2) {
    const app = this.scene3d.getCurrentApp();
    if (!app) {
      return {
        x: 0,
        y: 0,
        z: 0,
      };
    }
    // const camera = this.scene3d.camera!;
    // const pX = (point.x / app.domElement.clientWidth) * 2 - 1;
    // const pY = -(point.y / app.domElement.clientHeight) * 2 + 1;
    // const v = new THREE.Vector3(pX, pY, 0.5);
    // v.unproject(camera);
    // // 点击的点相对于相机位置的基向量
    // v.sub(camera.position).normalize();
    // // 因为相机位置是确定的，可以靠指定想要的场景 z 、相机的 z 和基向量的 z 倒推，算出放大倍数，再把基向量同比放大，用相机位置去加放大的偏移量
    // const distance = -camera.position.z / v.z;
    // const pos = new THREE.Vector3();
    // pos.copy(camera.position).add(v.multiplyScalar(distance));
    // return {
    //   x: pos.x,
    //   y: pos.y,
    //   z: pos.z,
    // };
    const ctrl = this.scene3d.getCurrentInteractiveController();
    if (ctrl) {
      return ctrl.hitTargetOriginalByPoint(point).originalTargetPoint as Vec3;
    }
    return {
      x: 0,
      y: 0,
      z: 0,
    };
  }

  sceneToCanvasImpl(point: Vec3) {
    const scenePointVector = new THREE.Vector3(point.x, point.y, point.z);
    scenePointVector.project(this.scene3d.camera!);
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
      x: Math.round(scenePointVector.x * halfWidth + halfWidth),
      y: Math.round(-scenePointVector.y * halfHeight + halfHeight),
    };
  }
}

export class Scene3D extends BaseScene<THREE.WebGLRenderer, THREE.Scene, THREE.Camera, THREE.Raycaster, THREE.Group, THREE.Object3D, THREE.Sprite> {
  defaultSceneViewType = Scene3DSymbol;
  sceneType = SceneType.Scene3D;
  sceneContext: SceneContext<THREE.Object3D, Vec3>;
  controls: OrbitControls;
  raycaster = new THREE.Raycaster();

  render() {
    if (!Scene3dContext) {
      return null;
    }

    return (
      <Scene3dContext.Provider value={this.sceneContext}>
        {this.props.children}
      </Scene3dContext.Provider>
    );
  }

  createView() {
    return new THREE.Group();
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
    const { backgroundColor = BaseScene.BACKGROUND_COLOR, transparent = BaseScene.TRANSPARENT, width = BaseScene.DEFAULT_WIDTH, height = BaseScene.DEFAULT_HEIGHT, cameraPosition, cameraTarget } = this.props;
    // 初始化应用
    this.scene = new THREE.Scene();
    // 默认提供一个相机，可在检测到相机组件后替换掉
    this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 30000);
    const app = new THREE.WebGLRenderer({
      alpha: transparent,
      antialias: true,
    });
    app.setSize(width, height);
    app.setClearColor(backgroundColor);
    app.setPixelRatio(this.resolution);
    if (this.props.outputEncoding) {
      app.outputEncoding = this.props.outputEncoding;
    }
    this.updateCameraPosition(cameraPosition as Vec3);
    this.controls = new OrbitControls(this.camera, app.domElement);
    this.updateCameraTarget(cameraTarget as Vec3);
    const animate = () => {
      requestAnimationFrame(animate);
      this.controls.update();
      app.render(this.scene!, this.camera!);
    };
    animate();
    return app;
  }

  updateCameraPosition(v: Vec3) {
    this.camera?.position.set(v.x || 0, v.y || 0, v.z || 0);
  }

  updateCameraTarget(cameraTarget: Vec3) {
    this.controls.target = new THREE.Vector3(cameraTarget?.x || 0, cameraTarget?.y || 0, cameraTarget?.z || 0);
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
      const originalTarget = objects[i]; // closest first
      if (!originalTarget) {
        return {
          originalTarget: undefined,
          target: undefined,
          originalTargetPoint: undefined,
        };
      }
      // 找到最近的一个可交互的对象
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
      /** @todo 暂时先写死 */
      const frustumSize = 1000;
      this.camera.left = -frustumSize * aspect / 2;
      this.camera.right = frustumSize * aspect / 2;
      this.camera.top = frustumSize / 2;
      this.camera.bottom = -frustumSize / 2;
      this.camera.updateProjectionMatrix();
    }
    app.setSize(width, height);
  }

  initBackGroundImage() {
    const { width, height, props: { backgroundImage } } = this;
    if (backgroundImage) {
      const map = new THREE.TextureLoader().load(backgroundImage);
      const material = new THREE.SpriteMaterial({ map, color: 0xffffff });
      const image = new THREE.Sprite(material);
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
  }

  removeAppChildrenView() {
    this.scene!.clear();
  }

  /** 获取截图 */
  getScreenShot() {
    const app = this.getCurrentApp();
    if (!app) {
      return '';
    }
    app.render(this.scene!, this.camera!);
    const imgData = app.domElement.toDataURL('image/jpeg');
    return imgData;
  }

  canvasScaleImpl() {
    //
  }

  canvasDragImpl() {
    //
  }
}
