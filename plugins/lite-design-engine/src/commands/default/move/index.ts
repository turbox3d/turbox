/* eslint-disable @typescript-eslint/member-ordering */
import * as THREE from 'three';
import { BaseCommand, Action, IViewEntity, SceneEvent, EntityObject, Vec3, Vector3, ITool } from '@turbox3d/turbox3d';
import { ProductEntity } from '../../../models/entity/product';
import { appCommandBox } from '../../index';
import { SkewPointSymbol, ScalePointSymbol, RotatePointSymbol, ClipPointSymbol, AdjustPointSymbol } from '../../../consts/scene';
import { AssemblyEntity } from '../../../models/entity/assembly';
import { SkewPointEntity } from '../../../models/entity/skewPoint';
import { EntityCategory } from '../../../utils/category';
import { SceneUtil } from '../../../views/scene/modelsWorld/index';
import { ldeStore } from '../../../models/index';

export class MoveCommand extends BaseCommand {
  private action: Action;
  private target?: ProductEntity | AssemblyEntity | SkewPointEntity | THREE.Group;
  private initPosition?: Vector3;
  private initModelPosition?: Vector3;
  private matrixWorld?: THREE.Matrix4;

  protected onDragStart(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    this.action = Action.create('moveProduct');
    this.action.execute(() => {
      const selected = appCommandBox.defaultCommand.select.getSelectedEntities()[0];
      const unselected = [...ldeStore.document.models.values()].filter(m => EntityCategory.isProduct(m) && m !== selected);
      unselected.forEach(m => m.setInteractive(false));
      const ve = tools.hitTarget(event.canvasPosition)!;
      unselected.forEach(m => m.setInteractive(true));
      if (viewEntity.type === SkewPointSymbol) {
        this.target = EntityObject.getEntityById(viewEntity.id) as SkewPointEntity;
      } else if (viewEntity.type === ScalePointSymbol) {
        this.target = undefined;
      } else if (viewEntity.type === RotatePointSymbol) {
        this.target = undefined;
      } else if (viewEntity.type === AdjustPointSymbol) {
        this.target = undefined;
      } else if (viewEntity.type === ClipPointSymbol) {
        this.target = undefined;
      } else if (
        selected &&
        (selected.id === EntityObject.getEntityById(viewEntity.id)?.getRoot().id || (ve && ve.id === selected.id)) &&
        (EntityCategory.isProduct(selected) || EntityCategory.isAssembly(selected))
      ) {
        if (selected.locked) {
          return;
        }
        this.target = selected.getRoot();
      } else {
        // 移动画布
        if (ldeStore.scene.isSkewMode || ldeStore.scene.isClipMode) {
          return;
        }
        this.target = SceneUtil.getRootView() as THREE.Group;
      }
      if (this.target) {
        if (this.target instanceof THREE.Group) {
          // 移动画布
          const mp = event.getScenePosition(this.target.position.z) as Vec3;
          this.matrixWorld = (SceneUtil.getRootView() as THREE.Group).matrixWorld.clone();
          const mps = new THREE.Vector3(mp.x, mp.y, mp.z).applyMatrix4(this.matrixWorld).toArray();
          this.initPosition = new Vector3(...mps);
        } else {
          const mp = event.getScenePosition(this.target.position.z) as Vec3;
          this.initPosition = new Vector3(mp.x, mp.y, mp.z);
          if (viewEntity.type === SkewPointSymbol) {
            const model = EntityObject.getEntityById(viewEntity.id)?.parent as ProductEntity;
            const v = this.initPosition.clone().applyMatrix4(model.getMatrix4().inverted());
            this.initPosition = v;
          }
          const position = this.target.position.toArray();
          this.initModelPosition = new Vector3(...position);
        }
      }
    }, undefined, true, { immediately: true });
  }

  protected onDragMove(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    if (!this.initPosition || !this.target) {
      return;
    }
    let sp = event.getScenePosition(this.target.position.z) as Vec3;
    if (this.target instanceof THREE.Group) {
      // 移动画布
      const mps = new THREE.Vector3(sp.x, sp.y, sp.z).applyMatrix4(this.matrixWorld!).toArray();
      sp = new Vector3(...mps);
    }
    const camera = tools.getCamera() as THREE.OrthographicCamera;
    let currentPosition: Vector3 | undefined;
    if (camera) {
      const cameraPosition = new Vector3(camera.position.x, camera.position.y, camera.position.z);
      const dist = this.initPosition.clone().subtracted(cameraPosition).length;
      const rayDir = new Vector3(sp.x, sp.y, sp.z).subtracted(cameraPosition).normalize();
      currentPosition = cameraPosition.added(rayDir.multiplyScalar(dist));
    } else if (viewEntity.type === SkewPointSymbol) {
      const model = EntityObject.getEntityById(viewEntity.id)?.parent as ProductEntity;
      const v = new Vector3(sp.x, sp.y, sp.z).applyMatrix4(model.getMatrix4().inverted());
      currentPosition = v;
    }
    if (!currentPosition) {
      return;
    }
    const runner = () => {
      if (this.target instanceof THREE.Group) {
        // 移动画布
        this.target.position.x += (currentPosition!.x - this.initPosition!.x);
        this.target.position.y += (currentPosition!.y - this.initPosition!.y);
        ldeStore.scene.$update({
          canvasPosition: {
            x: this.target.position.x,
            y: this.target.position.y,
          },
        });
      } else {
        const offset = this.initPosition!.subtracted(this.initModelPosition!);
        const position = currentPosition!.subtracted(offset);
        const v = this.target!.position.toArray();
        const positionOffset = position.subtracted(new Vector3(...v));
        this.target!.setPosition({
          x: position.x,
          y: position.y,
        });
        // 多选的其他模型也要更改位置
        const models = appCommandBox.defaultCommand.select.getSelectedEntities().filter(s => s !== this.target);
        models.forEach(m => {
          const newPosition = m.position.added(positionOffset);
          m.setPosition({
            x: newPosition.x,
            y: newPosition.y,
          });
        });
      }
    };
    if (EntityCategory.isSkewPoint(this.target)) {
      ldeStore.actions.skewAction.execute(runner, undefined, true, { immediately: true });
    } else {
      this.action.execute(runner, undefined, true, { immediately: true });
    }
  }

  protected onDragEnd() {
    if (!this.initPosition || !this.target || this.target instanceof THREE.Group || EntityCategory.isSkewPoint(this.target)) {
      this.action.abort();
    } else {
      this.action.complete();
    }
    this.initPosition = undefined;
    this.initModelPosition = undefined;
    this.target = undefined;
  }
}
