import { Domain, reactor, Vector3, mutation } from '@turbox3d/turbox';

import { CameraDistance } from '../../common/consts/scene';

export class SceneDomain extends Domain {
  /** 设备类型 */
  @reactor deviceType: 'iPad' | 'PC' = 'PC';
  @reactor cameraPosition = new Vector3(0, 0, CameraDistance.CAMERA);
  @reactor cameraTarget = new Vector3(0, 0, 0);
  @reactor cameraControlsEnabled = false;
  /** 中间阴影部分画布区域的缩放 */
  @reactor canvasZoom = 1;
  /** 画布缩放的限制范围 */
  @reactor canvasZoomRange = [0.1, 2];
  /** 中间阴影部分画布区域的位置 */
  @reactor canvasPosition = { x: 0, y: 0 };
  /** 中间阴影部分画布区域的尺寸比例 */
  @reactor canvasRatio = 16 / 9;
  /** 中间阴影部分画布区域的边距比例 */
  @reactor canvasMarginRatio = 0.95;
  @reactor isSkewMode = false;
  @reactor isClipMode = false;
  @reactor isPdfMode = false;
  @reactor hideSkewPoint = false;
  /** 场景的宽度 */
  @reactor sceneWidth = 0;
  /** 场景的高度 */
  @reactor sceneHeight = 0;
  @reactor hideClipPoint = false;
  @reactor resolution = window.devicePixelRatio;
  @reactor renderFlag2d = false;
  @reactor renderFlag3d = true;

  @mutation
  setResolution(res = window.devicePixelRatio) {
    this.resolution = res;
  }

  @mutation('', true)
  setRenderFlag2d(flag: boolean) {
    this.renderFlag2d = flag;
  }

  @mutation('', true)
  setRenderFlag3d(flag: boolean) {
    this.renderFlag3d = flag;
  }
}
