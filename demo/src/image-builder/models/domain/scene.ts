import { Domain, reactor, mutation, SceneTool, Vector2 } from '@turbox3d/turbox';

export class SceneDomain extends Domain {
  /** 画布区域的缩放 */
  @reactor canvasZoom = 1;
  /** 画布缩放的限制范围 */
  @reactor canvasZoomRange = [0.1, 2];
  /** 场景的尺寸 */
  @reactor sceneSize = { width: 0, height: 0 };
  @reactor resolution = window.devicePixelRatio;
  @reactor renderFlag2d = true;
  @reactor snapLines: Vector2[][] = [];

  private sceneTools: SceneTool;

  @mutation
  setResolution(res = window.devicePixelRatio) {
    this.resolution = res;
  }

  @mutation('', true)
  setRenderFlag2d(flag: boolean) {
    this.renderFlag2d = flag;
  }

  @mutation
  addSnapLines(lines: Vector2[][]) {
    this.snapLines.push(...lines);
  }

  @mutation
  clearSnapLines() {
    this.snapLines = [];
  }

  setSceneTools(sceneTools: SceneTool) {
    this.sceneTools = sceneTools;
  }

  getSceneTools() {
    return this.sceneTools;
  }
}
