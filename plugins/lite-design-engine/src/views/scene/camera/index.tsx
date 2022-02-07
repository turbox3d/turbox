import { Mesh3D } from '@turbox3d/turbox3d';
import * as THREE from 'three';

export class Camera extends Mesh3D {
  // protected view = new THREE.PerspectiveCamera(
  //   100,
  //   window.innerWidth / window.innerHeight,
  //   1,
  //   30000
  // );
  protected view = new THREE.OrthographicCamera(
    -window.innerWidth / 2,
    window.innerWidth / 2,
    window.innerHeight / 2,
    -window.innerHeight / 2,
    1,
    30000
  );
  protected viewType: 'camera' | 'light' | 'model' = 'camera';
}
