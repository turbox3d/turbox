import { Domain, reactor, mutation, SceneTool } from '@byted-tx3d/turbox';

export class SceneDomain extends Domain {
  /** 画布区域的缩放 */
  @reactor canvasZoom = 1;
  /** 画布缩放的限制范围 */
  @reactor canvasZoomRange = [0.1, 2];
  /** 场景的尺寸 */
  @reactor sceneSize = { width: 0, height: 0 };
  @reactor resolution = window.devicePixelRatio;
  @reactor renderFlag2d = true;
  private sceneTools: SceneTool;

  @mutation
  setResolution(res = window.devicePixelRatio) {
    this.resolution = res;
  }

  @mutation('', true)
  setRenderFlag2d(flag: boolean) {
    this.renderFlag2d = flag;
  }

  setSceneTools(sceneTools: SceneTool) {
    this.sceneTools = sceneTools;
  }

  getSceneTools() {
    return this.sceneTools;
  }
}
