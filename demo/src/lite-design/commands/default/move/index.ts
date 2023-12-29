/* eslint-disable @typescript-eslint/member-ordering */
import * as THREE from 'three';

import { Command, Action, ViewEntity, SceneEvent, EntityObject, SceneTool, Vec2 } from '@turbox3d/turbox';

import {
  ProductSymbol,
  CubeSymbol,
  AssemblySymbol,
  ScalePointSymbol,
  RotatePointSymbol,
  AdjustPointSymbol,
  DeletePointSymbol
} from '../../../common/consts/scene';
import { AssemblyEntity } from '../../../models/entity/assembly';
import { ProductEntity } from '../../../models/entity/product';
import { ldeStore } from '../../../models/index';
import { EntityCategory } from '../../../utils/category';
import { SceneUtil } from '../../../views/scene/modelsWorld/index';
import { appCommandManager } from '../../index';

export class MoveCommand extends Command {
  private action: Action;
  private target?: ProductEntity | AssemblyEntity | THREE.Group;
  private offset?: THREE.Vector3;
  private matrixWorld?: THREE.Matrix4;
  private plane = new THREE.Plane();

  protected onDragStart(viewEntity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    this.action = Action.create('moveProduct');
    this.action.execute(
      () => {
        const selected = appCommandManager.defaultCommand.select.getSelectedEntities()[0];
        const unselected = [...ldeStore.document.models.values()].filter(
          m => EntityCategory.isProduct(m) && m !== selected
        );
        unselected.forEach(m => m.setInteractive(false));
        const ve = tools.hitTarget(event.canvasPosition)!;
        unselected.forEach(m => m.setInteractive(true));
        if (
          (selected &&
            (selected.id === EntityObject.getEntityById(viewEntity.id)?.getRoot().id ||
              (ve && ve.id === selected.id)) &&
            viewEntity.type === ProductSymbol) ||
          viewEntity.type === CubeSymbol ||
          viewEntity.type === AssemblySymbol
        ) {
          if (selected.locked) {
            return;
          }
          this.target = selected.getRoot();
        } else if (
          viewEntity.type !== ScalePointSymbol &&
          viewEntity.type !== RotatePointSymbol &&
          viewEntity.type !== AdjustPointSymbol &&
          viewEntity.type !== DeletePointSymbol
        ) {
          // 移动画布
          if (ldeStore.scene.isSkewMode || ldeStore.scene.isClipMode) {
            return;
          }
          this.target = SceneUtil.getRootView() as THREE.Group;
        }
        if (this.target) {
          this.matrixWorld = (SceneUtil.getRootView() as THREE.Group).matrixWorld.clone();
          if (this.target instanceof THREE.Group) {
            this.matrixWorld = (SceneUtil.getRootView() as THREE.Group).parent!.matrixWorld.clone();
          }
          const camera = tools.getCamera() as THREE.PerspectiveCamera;
          const raycaster = tools.getRaycaster() as THREE.Raycaster;
          const mp = this.target.position;
          const worldPosition = new THREE.Vector3(mp.x, mp.y, mp.z).applyMatrix4(this.matrixWorld);
          this.plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this.plane.normal), worldPosition);
          const intersection = new THREE.Vector3();
          if (raycaster.ray.intersectPlane(this.plane, intersection)) {
            this.offset = intersection.clone().sub(worldPosition);
          }
        }
      },
      undefined,
      true,
      { immediately: true }
    );
  }

  getRelativePositionFromEvent(vec: Vec2, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: vec.x - rect.left,
      y: vec.y - rect.top,
    };
    if (point.x <= 0 || point.y <= 0 || point.x > rect.width || point.y > rect.height) {
      return undefined;
    }
    return point;
  }

  protected onDragMove(viewEntity: ViewEntity, event: SceneEvent, tools: SceneTool) {
    if (!this.target) {
      return;
    }
    this.action.execute(
      () => {
        const camera = tools.getCamera() as THREE.PerspectiveCamera;
        const raycaster = tools.getRaycaster() as THREE.Raycaster;
        const mouse = { x: 0, y: 0 };
        const app = tools.getApp() as THREE.WebGLRenderer;
        const point = this.getRelativePositionFromEvent(
          {
            x: event.event.clientX,
            y: event.event.clientY,
          },
          app.domElement
        );
        if (!point || !this.offset) {
          return;
        }
        mouse.x = (point.x / app.domElement.clientWidth) * 2 - 1;
        mouse.y = -(point.y / app.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
        const intersection = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(this.plane.clone(), intersection)) {
          const position = intersection.clone().sub(this.offset).applyMatrix4(this.matrixWorld!.clone().invert());
          // const v = this.target!.position.toArray();
          // const positionOffset = position.clone().sub(new THREE.Vector3(...v));
          if (this.target instanceof THREE.Group) {
            this.target.position.x = position.x;
            this.target.position.y = position.y;
            ldeStore.scene.$update({
              canvasPosition: {
                x: this.target.position.x,
                y: this.target.position.y,
              },
            });
          } else {
            this.target!.setPosition({
              x: position.x,
              y: position.y,
            });
          }
          // 多选的其他模型也要更改位置
          // const models = appCommandManager.defaultCommand.select.getSelectedEntities().filter(s => s !== this.target);
          // models.forEach(m => {
          //   const newPosition = m.position.added(new Vector3(...positionOffset.toArray()));
          //   m.setPosition({
          //     x: newPosition.x,
          //     y: newPosition.y,
          //     z: newPosition.z,
          //   });
          // });
        }
      },
      undefined,
      true,
      { immediately: true }
    );
  }

  protected onDragEnd() {
    if (!this.target || this.target instanceof THREE.Group) {
      this.action.abort();
    } else {
      this.action.complete();
    }
    this.offset = undefined;
    this.target = undefined;
    this.matrixWorld = undefined;
    this.plane = new THREE.Plane();
  }
}
