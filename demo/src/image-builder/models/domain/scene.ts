import { Domain, reactor, mutation, SceneTool, Vector2, Box2 } from '@turbox3d/turbox';
import { imageBuilderStore } from '..';
import { ItemEntity } from '../entity/item';
import { ItemType } from '../../common/consts/scene';
import { getMaxWidthWord, getTextBounds } from '../../common/utils/text';

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
  @reactor sceneTools?: SceneTool;
  @reactor cameraPosition = { x: 0, y: 0 };

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

  getEntityMinWidth(target: ItemEntity) {
    if (target.itemType === ItemType.TEXT) {
      return getMaxWidthWord(target);
    } else if (target.itemType === ItemType.BUTTON) {
      return getTextBounds(target).width;
    }
    return 10;
  }

  getEntityMinHeight(target: ItemEntity) {
    if (target.itemType === ItemType.BUTTON) {
      return getTextBounds(target).height;
    }
    return 10;
  }
}
