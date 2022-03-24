/* eslint-disable @typescript-eslint/member-ordering */
import { BaseCommand, Action, IViewEntity, SceneEvent, EntityObject, Vec3, Vector3, ITool } from '@turbox3d/turbox3d';
import { ClipPointSymbol } from '../../consts/scene';
import { ClipPointEntity } from '../../models/entity/clipPoint';
import { ldeStore } from '../../models/index';
import { EntityCategory } from '../../utils/category';

export class ClipCommand extends BaseCommand {
  private action: Action;
  private target?: ClipPointEntity;
  private initPosition?: Vector3;
  private initModelPosition?: Vector3;

  protected onDragStart(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    this.action = ldeStore.actions.clipAction;
    if (viewEntity.type === ClipPointSymbol) {
      this.target = EntityObject.getEntityById(viewEntity.id) as ClipPointEntity;
    }
    if (this.target) {
      const mp = event.getScenePosition(this.target.position.z) as Vec3;
      this.initPosition = new Vector3(mp.x, mp.y, mp.z);
      this.initModelPosition = this.target.position.clone();
    }
  }

  protected onDragMove(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    if (!this.initPosition || !this.target || !this.initModelPosition) {
      return;
    }
    const allClipPoints = [...this.target.parent!.children.values()].filter(child => EntityCategory.isClipPoint(child))

    const sp = event.getScenePosition(this.target.position.z) as Vec3;
    const delta = new Vector3(sp.x, sp.y, sp.z).sub(this.initPosition).applyAxisAngle(new Vector3(0, 0, 1), -this.target.parent!.rotation.z * Math.PI / 180); // 全局delta施加旋转逆变换到模型本地坐标
    const position = this.initModelPosition.clone().add(delta);
    // 最小范围界定
    const index = allClipPoints.indexOf(this.target);
    const diagonalP = allClipPoints[[2, 3, 0, 1][index]].position;// 对角点索引数组
    const size = this.target.parent!.size;

    const MIN_D = 30; // 剪裁区域最小边长
    // x
    if( this.target.position.x < diagonalP.x) {
      if (position.x < -size.x / 2) { position.x = - size.x / 2}
      if (position.x > diagonalP.x - MIN_D ) { position.x = diagonalP.x - MIN_D}
    }
    if( this.target.position.x > diagonalP.x) {
      if (position.x > size.x / 2) { position.x = size.x / 2}
      if (position.x < diagonalP.x + MIN_D ) { position.x = diagonalP.x + MIN_D}
    }
    // y
    if( this.target.position.y < diagonalP.y) {
      if (position.y < -size.y / 2) { position.y = - size.y / 2}
      if (position.y > diagonalP.y - MIN_D ) { position.y = diagonalP.y - MIN_D}
    }
    if( this.target.position.y > diagonalP.y) {
      if (position.y > size.y / 2) { position.y = size.y / 2}
      if (position.y < diagonalP.y + MIN_D ) { position.y = diagonalP.y + MIN_D}
    }

    this.action.execute(() => {
      if (this.target) {
        position.y = Math.max(- size.y / 2, position.y);
        // move other
        const otherClipPoints = allClipPoints.filter(child => child !== this.target);
        let otherVerticalP = otherClipPoints.find(p => p.position.x === this.target!.position.x && p.position.y !== this.target!.position.y);
        let otherHorizonP = otherClipPoints.find(p => p.position.y === this.target!.position.y && p.position.x !== this.target!.position.x);
        if (!otherVerticalP) {
          otherVerticalP = otherClipPoints.find(p => p.position.x === this.target!.position.x)!
        }
        if (!otherHorizonP) {
          otherHorizonP = otherClipPoints.find(p => p.position.y === this.target!.position.y)!
        }
        otherVerticalP.setPosition({ x: position.x })
        otherHorizonP.setPosition({ y: position.y })
        // move self
        this.target.setPosition({ x: position.x, y: position.y });
      }
    }, undefined, true, { immediately: true });
  }

  protected onDragEnd() {
    this.target = undefined;
  }
}
