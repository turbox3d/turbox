import * as THREE from 'three';
import { BaseMesh } from '@turbox3d/graphic-view';
import { Vec2 } from '@turbox3d/shared';
import { Scene3dContext } from '../Scene3D/context';
import { Scene3D } from '../Scene3D/index';

export abstract class Mesh3D<Props = {}, State = never> extends BaseMesh<Props, State, THREE.WebGLRenderer, THREE.Scene, THREE.Camera, THREE.Group, THREE.Object3D, THREE.Sprite, Vec2> {
  static contextType = Scene3dContext;

  createDefaultView() {
    return new THREE.Group();
  }

  addChildView(view: THREE.Object3D) {
    this.view.add(view);
  }

  clearView() {
    this.view.parent?.clear();
  }

  removeFromWorld() {
    this.view.parent?.clear();
  }

  setViewInteractive(interactive: boolean) {
    this.view.userData.interactive = interactive;
  }

  addViewToScene(scene3d: Scene3D, view: THREE.Object3D) {
    scene3d.scene!.add(view);
    const isCamera = this.viewType === 'camera';
    if (isCamera) {
      scene3d.camera = view as THREE.Camera;
    }
  }
}
