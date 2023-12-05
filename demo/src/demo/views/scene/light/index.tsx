import * as THREE from 'three';

import { Mesh3D } from '@turbox3d/turbox';

import { ldeStore } from '../../../models/index';
import { SceneUtil } from '../modelsWorld/index';

export class AmbientLight extends Mesh3D<{}> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new THREE.AmbientLight(0xffffff, 0.5);
  protected viewType: 'camera' | 'light' | 'model' = 'light';

  updateGeometry() {
    this.view.position.set(0, 200, 0);
  }
}

export class SpotLight extends Mesh3D<{}> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new THREE.SpotLight(0xffffff);
  protected viewType: 'camera' | 'light' | 'model' = 'light';

  updateGeometry() {
    this.view.position.set(0, 1000, 0);
    this.view.castShadow = true;
    this.view.shadow.mapSize.width = 1024;
    this.view.shadow.mapSize.height = 1024;
    this.view.shadow.camera.near = 500;
    this.view.shadow.camera.far = 4000;
    this.view.shadow.camera.fov = 30;
  }
}

export class HemisphereLight extends Mesh3D<{}> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
  protected viewType: 'camera' | 'light' | 'model' = 'light';

  updateGeometry() {
    this.view.position.set(0, 200, 0);
  }
}

export class DirectionalLight extends Mesh3D<{}> {
  protected reactivePipeLine = [this.updateGeometry];
  protected view = new THREE.DirectionalLight(0xffffff, 1);
  protected viewType: 'camera' | 'light' | 'model' = 'light';

  updateGeometry() {
    const skyBox = ldeStore.document.getSkyBoxModel();
    if (!skyBox) {
      return;
    }
    this.view.position.set(0, skyBox.size.y / 2, skyBox.size.z / 2);
    this.view.castShadow = true;
    this.view.shadow.mapSize.width = 2048;
    this.view.shadow.mapSize.height = 2048;
    this.view.shadow.camera.left = -skyBox.size.x / 2;
    this.view.shadow.camera.right = skyBox.size.x / 2;
    this.view.shadow.camera.top = skyBox.size.z / 2;
    this.view.shadow.camera.bottom = -skyBox.size.z / 2;
    this.view.shadow.camera.far = skyBox.size.y;
    this.view.shadow.bias = -0.0001;
    const scene = SceneUtil.getScene() as THREE.Scene;
    const targetObject = new THREE.Object3D();
    targetObject.position.set(0, -skyBox.size.y / 2, skyBox.size.z / 2);
    scene.add(targetObject);
    this.view.target = targetObject;
    // const h = new THREE.CameraHelper(this.view.shadow.camera);
    // scene.add(h);
  }
}
