import { Mesh3D } from '@turbox3d/turbox';
import * as THREE from 'three';
import { EyeDistance } from '../../../consts/scene';
import { ldeStore } from '../../../models/index';

const NEAR_RATIO = 0.0001;

export class OrthographicCamera extends Mesh3D {
  protected view = new THREE.OrthographicCamera(
    -ldeStore.scene.sceneWidth / 2,
    ldeStore.scene.sceneWidth / 2,
    ldeStore.scene.sceneHeight / 2,
    -ldeStore.scene.sceneHeight / 2,
    1,
    30000
  );
  protected viewType: 'camera' | 'light' | 'model' = 'camera';
}

export class PerspectiveCamera extends Mesh3D {
  protected view = new THREE.PerspectiveCamera(
    50,
    ldeStore.scene.sceneWidth / ldeStore.scene.sceneHeight,
    EyeDistance.CAMERA * NEAR_RATIO,
    EyeDistance.CAMERA * (2 - NEAR_RATIO),
  );
  protected viewType: 'camera' | 'light' | 'model' = 'camera';
}
