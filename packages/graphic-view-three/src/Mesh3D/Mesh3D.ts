import * as THREE from 'three';
import { BaseMesh } from '@turbox3d/graphic-view';
import { Vec2 } from '@turbox3d/shared';
import { Scene3dContext } from '../Scene3D/context';

export abstract class Mesh3D<Props = {}, State = never> extends BaseMesh<Props, State, THREE.WebGLRenderer, THREE.Group, THREE.Object3D, THREE.Sprite, Vec2> {
  static contextType = Scene3dContext;

  createDefaultView() {
    return new THREE.Group();
  }

  addChildView(view: THREE.Object3D) {
    if (this.view instanceof THREE.Group) {
      this.view.add(view);
    }
  }

  clearView() {
    if (this.view instanceof THREE.Mesh) {
      this.view.clear();
    }
  }

  removeFromWorld() {
    this.view.clear();
  }

  setViewInteractive(interactive: boolean) {
    this.view.userData.interactive = interactive;
  }
}
