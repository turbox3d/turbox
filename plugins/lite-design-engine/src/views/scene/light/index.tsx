import { Mesh3D } from '@turbox3d/turbox3d';
import * as THREE from 'three';

export class Light extends Mesh3D<{}> {
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
