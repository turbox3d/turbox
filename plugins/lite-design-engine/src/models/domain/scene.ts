import { Domain, reactor, Vector3, mutation } from '@turbox3d/turbox3d';
import { EyeDistance } from '../../consts/scene';

export class SceneDomain extends Domain {
  /** 业务类型 */
  @reactor bizType: 'iPad' | 'PC' = 'iPad';
  @reactor cameraPosition = new Vector3(0, 0, EyeDistance.CAMERA);
  @reactor cameraTarget = new Vector3(0, 0, 0);
  @reactor cameraControlsEnabled = false;
  /** 中央阴影部分画布区域的缩放 */
  @reactor canvasZoom = 1;
  /** 中央阴影部分画布区域的位置 */
  @reactor canvasPosition = { x: 0, y: 0 };
  /** 中央阴影部分画布区域的尺寸比例 */
  @reactor canvasRatio = 16 / 9;
  /** 中央阴影部分画布区域的边距比例 */
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
