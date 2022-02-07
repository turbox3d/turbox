import { Mesh3D } from '@turbox3d/renderer-three';
import * as THREE from 'three';

/** 坐标轴 3d 控件 */
export default class Axis3d extends Mesh3D {
  protected view = new THREE.AxesHelper(5000);
}
