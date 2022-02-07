import * as THREE from 'three';
import { BaseMesh } from '@turbox3d/renderer-core';
import { Vec2 } from '@turbox3d/shared';
import { Scene3D } from '../Scene3D/index';

export abstract class Mesh3D<Props = {}, State = never> extends BaseMesh<Props, State, THREE.WebGLRenderer, THREE.Scene, THREE.Camera, THREE.Raycaster, THREE.Group, THREE.Object3D, THREE.Sprite, Vec2> {
  createDefaultView() {
    return new THREE.Group();
  }

  addChildView(view: THREE.Object3D) {
    this.view.add(view);
  }

  clearView() {
    // if (this.view instanceof THREE.Mesh) {
    //   this.view.clear();
    // }
  }

  removeFromWorld() {
    this.view.removeFromParent();
  }

  setViewInteractive(interactive: boolean) {
    this.view.userData.interactive = interactive;
  }

  addViewToScene(scene3d: Scene3D, view: THREE.Object3D) {
    scene3d.scene!.add(view);
    const isCamera = this.viewType === 'camera';
    if (isCamera) {
      scene3d.camera = view as THREE.Camera;
      scene3d.controls.object = view as THREE.Camera;
    }
  }
}
