import { Domain, reactor, mutation, SceneTool, Vector2, Box2 } from '@turbox3d/turbox';
import { imageBuilderStore } from '..';

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
  @reactor isTextStretching = false;
  @reactor currentTextMinWidth = -1;
  @reactor textBounds = { width: 0, height: 0 };
  @reactor sceneTools?: SceneTool;
  @reactor cameraPosition = { x: 0, y: 0 };

  @mutation
  setTextStretching(flag: boolean) {
    this.isTextStretching = flag;
  }

  @mutation
  setCurrentTextMinWidth(width: number) {
    this.currentTextMinWidth = width;
  }

  @mutation
  setTextBounds(bounds: Partial<{ width: number; height: number }>) {
    bounds.width && (this.textBounds.width = bounds.width);
    bounds.height && (this.textBounds.height = bounds.height);
  }

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

  @mutation
  setSceneTools(sceneTools: SceneTool) {
    this.sceneTools = sceneTools;
  }

  isShowInvalidRangeFrame() {
    const frames = imageBuilderStore.document.getFrameEntities();
    const items = imageBuilderStore.document.getItemEntities();
    const showInvalidRangeFrame = frames[0] && !items.map(i => new Box2().setFromPoints(i.getBox2AABB(undefined, true))).every(b => new Box2().setFromPoints(frames[0].getBox2AABB(undefined, true)).containsBox(b));
    return showInvalidRangeFrame;
  }
}
