import {
  BaseCommand,
  Action,
  IViewEntity,
  SceneEvent,
  EntityObject,
  Vec3,
  Vector3,
  ITool,
  Vector2,
  Vec2,
  BaseScene,
  CoordinateType,
  IGesturesExtra,
} from '@turbox3d/turbox';
import { MathAlg, Line2d } from '@turbox3d/homestyler-math';
import * as THREE from 'three';
import { ProductEntity } from '../../../models/entity/product';
import { ScalePointEntity } from '../../../models/entity/scalePoint';
import { EntityCategory } from '../../../utils/category';
import { appCommandBox } from '../../index';
import { ScalePointSymbol, AdjustPointSymbol } from '../../../consts/scene';
import { SceneUtil } from '../../../views/scene/modelsWorld/index';
import { ldeStore } from '../../../models/index';
import { AdjustPointEntity } from '../../../models/entity/adjustPoint';

export const scaleAndRotateAction = {
  action: Action.create('scaleAndRotateProduct'),
  statusFlag: {
    scale: false,
    rotate: false,
  },
};

export class ScaleCommand extends BaseCommand {
  private currentScalePoint?: ScalePointEntity | AdjustPointEntity;
  private currentProduct?: ProductEntity | THREE.Group;
  private initSize?: Vec2;
  private pinchScaleOffset?: Vec2;
  private pinchScaleInitPosition?: Vec2;
  private pinchScaleInitScale?: Vec2;
  private initLength?: number;

  protected onDragStart(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    scaleAndRotateAction.statusFlag.scale = true;
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities()[0];
    if ((viewEntity.type === ScalePointSymbol || viewEntity.type === AdjustPointSymbol) && EntityCategory.isProduct(selected) && !selected.locked) {
      const target = EntityObject.getEntityById(viewEntity.id) as ScalePointEntity | AdjustPointEntity;
      this.currentProduct = selected as ProductEntity;
      this.currentScalePoint = target;
      if (viewEntity.type === AdjustPointSymbol) {
        const mp = event.getScenePosition(this.currentProduct.position.z) as Vec3;
        const localPoint = new Vector3(mp.x, mp.y, mp.z).applyMatrix4(this.currentProduct.getConcatenatedMatrix().inverted());
        this.initLength = localPoint.length;
        this.initSize = {
          x: this.currentProduct.size.x,
          y: this.currentProduct.size.y,
        };
      }
    }
  }

  protected onDragMove(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    if (!this.currentProduct || !this.currentScalePoint) {
      return;
    }
    const product = this.currentProduct as ProductEntity;
    const mp = event.getScenePosition(product.position.z) as Vec3;
    const localPoint = new Vector3(mp.x, mp.y, mp.z).applyMatrix4(product.getConcatenatedMatrix().inverted());
    if (this.initLength && this.initSize && EntityCategory.isAdjustPoint(this.currentScalePoint)) {
      scaleAndRotateAction.action.execute(() => {
        const product = this.currentProduct as ProductEntity;
        const scale = localPoint.length / this.initLength!;
        const deltaScale = {
          x: (this.initSize!.x * scale) / product.size.x,
          y: (this.initSize!.y * scale) / product.size.y,
        };
        product.setSize({
          x: this.initSize!.x * scale,
          y: this.initSize!.y * scale,
        });
        [...product.children.values()].filter(child => EntityCategory.isSkewPoint(child)).forEach((sp) => {
          sp.setPosition({
            x: sp.position.x * deltaScale.x,
            y: sp.position.y * deltaScale.y,
          });
        });
        product.updateControlPoints();
      }, undefined, true, { immediately: true });
    } else {
      const csp = this.currentScalePoint.position.clone();
      const direction = csp.x * csp.y > 0 ? new Vector2(1, -1) : new Vector2(1, 1);
      const result = MathAlg.CalculateIntersect.curve2ds(
        new Line2d(new Vector2(), new Vector2(csp.x, csp.y), [-Infinity, Infinity]),
        new Line2d(new Vector2(localPoint.x, localPoint.y), direction, [-Infinity, Infinity]),
      );
      const newPoint = result[0].point;
      const offset = new Vector2(newPoint.x, newPoint.y).subtracted(new Vector2(csp.x, csp.y));
      const size = new Vector2();
      const width = Math.abs(csp.x * 2);
      const height = Math.abs(csp.y * 2);
      if ((csp.x > 0 && newPoint.x < csp.x) || (csp.x < 0 && newPoint.x > csp.x)) {
        // 缩小
        size.x = width - Math.abs(offset.x);
        size.y = height - Math.abs(offset.y);
      } else {
        // 放大
        size.x = width + Math.abs(offset.x);
        size.y = height + Math.abs(offset.y);
      }
      const MIN_SIZE = 20;
      if (size.x <= MIN_SIZE) {
        return;
      }
      const newPosition = new Vector3(offset.x / 2, offset.y / 2, 0).applyMatrix4(product.getConcatenatedMatrix());
      scaleAndRotateAction.action.execute(() => {
        product.setPosition({
          x: newPosition.x,
          y: newPosition.y,
        });
        const deltaScale = { x: size.x / product.size.x, y: size.y / product.size.y };
        product.setSize(size);
        [...product.children.values()].filter(child => EntityCategory.isSkewPoint(child)).forEach((sp) => {
          sp.setPosition({
            x: sp.position.x * deltaScale.x,
            y: sp.position.y * deltaScale.y,
          });
        });
        product.updateControlPoints();
      }, undefined, true, { immediately: true });
    }
  }

  protected onDragEnd() {
    scaleAndRotateAction.statusFlag.scale = false;
    if (!this.currentProduct || !this.currentScalePoint) {
      scaleAndRotateAction.action.abort();
      scaleAndRotateAction.action = Action.create('scaleAndRotateProduct');
    } else {
      // console.log('scale', scaleAndRotateAction.statusFlag);
      if (!scaleAndRotateAction.statusFlag.scale && !scaleAndRotateAction.statusFlag.rotate) {
        scaleAndRotateAction.action.complete();
        scaleAndRotateAction.action = Action.create('scaleAndRotateProduct');
      }
    }
    this.currentProduct = undefined;
    this.currentScalePoint = undefined;
    this.initLength = undefined;
    this.initSize = undefined;
  }

  protected onPinchStart(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    scaleAndRotateAction.statusFlag.scale = true;
    const selected = appCommandBox.defaultCommand.select.getSelectedEntities()[0];
    const target = EntityObject.getEntityById(viewEntity.id) as ProductEntity;
    if (selected && selected.id === EntityObject.getEntityById(viewEntity.id)?.getRoot().id && (EntityCategory.isProduct(selected) || EntityCategory.isAssembly(selected))) {
      if (!selected.locked) {
        this.currentProduct = target;
        this.initSize = {
          x: this.currentProduct.size.x,
          y: this.currentProduct.size.y,
        };
      }
    } else {
      // 缩放画布
      if (ldeStore.scene.isSkewMode || ldeStore.scene.isClipMode) {
        return;
      }
      appCommandBox.defaultCommand.select.clearAllSelected();
      this.currentProduct = SceneUtil.getRootView() as THREE.Group;
      const eventCache = (event.extra as IGesturesExtra)?.eventCache || [];
      const v = tools.coordinateTransform({
        x: (eventCache[1].clientX + eventCache[0].clientX) / 2,
        y: (eventCache[1].clientY + eventCache[0].clientY) / 2,
      }, CoordinateType.ScreenToScene, 0);
      const matrixWorld = this.currentProduct.matrixWorld.clone();
      const { x, y } = new THREE.Vector3(v.x, v.y).applyMatrix4(matrixWorld);
      this.pinchScaleOffset = { x, y };
      this.pinchScaleInitPosition = {
        x: this.currentProduct.position.x,
        y: this.currentProduct.position.y,
      };
      this.pinchScaleInitScale = {
        x: this.currentProduct.scale.x,
        y: this.currentProduct.scale.y,
      };
    }
  }

  protected onPinch(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    if (!this.currentProduct) {
      return;
    }
    if (this.currentProduct instanceof THREE.Group && this.pinchScaleOffset && this.pinchScaleInitPosition && this.pinchScaleInitScale) {
      // 缩放画布
      let ratio = (event.extra as IGesturesExtra)?.scale || 1;
      const { x: offsetX, y: offsetY } = this.pinchScaleOffset;
      const [min, max] = ldeStore.scene.canvasZoomRange;
      ratio = Math.max(this.pinchScaleInitScale.x * ratio, min) / this.pinchScaleInitScale.x;
      ratio = Math.min(this.pinchScaleInitScale.x * ratio, max) / this.pinchScaleInitScale.x;
      this.currentProduct.scale.x = this.pinchScaleInitScale.x * ratio;
      this.currentProduct.scale.y = this.pinchScaleInitScale.y * ratio;
      this.currentProduct.position.x = offsetX + (this.pinchScaleInitPosition.x - offsetX) * ratio;
      this.currentProduct.position.y = offsetY + (this.pinchScaleInitPosition.y - offsetY) * ratio;
      ldeStore.scene.$update({
        canvasZoom: this.currentProduct.scale.x,
        canvasPosition: {
          x: this.currentProduct.position.x,
          y: this.currentProduct.position.y,
        },
      });
    } else if (this.initSize) {
      scaleAndRotateAction.action.execute(() => {
        const product = this.currentProduct as ProductEntity;
        const scale = (event.extra as IGesturesExtra)?.scale || 1;
        const deltaScale = {
          x: (this.initSize!.x * scale) / product.size.x,
          y: (this.initSize!.y * scale) / product.size.y,
        };
        product.setSize({
          x: this.initSize!.x * scale,
          y: this.initSize!.y * scale,
        });
        [...product.children.values()]
          .filter(child => EntityCategory.isSkewPoint(child))
          .forEach(sp => {
            sp.setPosition({
              x: sp.position.x * deltaScale.x,
              y: sp.position.y * deltaScale.y,
            });
          });
        product.updateControlPoints();
      }, undefined, true, { immediately: true });
    }
  }

  protected onPinchEnd(viewEntity: IViewEntity, event: SceneEvent) {
    scaleAndRotateAction.statusFlag.scale = false;
    if (!this.currentProduct || this.currentProduct instanceof THREE.Group) {
      scaleAndRotateAction.action.abort();
      scaleAndRotateAction.action = Action.create('scaleAndRotateProduct');
    } else {
      // console.log('scale2', scaleAndRotateAction.statusFlag);
      if (!scaleAndRotateAction.statusFlag.scale && !scaleAndRotateAction.statusFlag.rotate) {
        scaleAndRotateAction.action.complete();
        scaleAndRotateAction.action = Action.create('scaleAndRotateProduct');
      }
    }
    this.currentProduct = undefined;
    this.pinchScaleOffset = undefined;
    this.pinchScaleInitPosition = undefined;
    this.pinchScaleInitScale = undefined;
  }

  protected onZoom(viewEntity: IViewEntity, event: SceneEvent, tools: ITool) {
    if (ldeStore.scene.isSkewMode || ldeStore.scene.isClipMode) {
      return;
    }
    if (event.event instanceof WheelEvent) {
      let deltaRatio = event.event.deltaY > 0 ? BaseScene.SCALE_SMALLER : BaseScene.SCALE_BIGGER;
      const matrixWorld = (SceneUtil.getRootView() as THREE.Group).matrixWorld.clone();
      const v = tools.coordinateTransform({
        x: event.event.offsetX,
        y: event.event.offsetY,
      }, CoordinateType.CanvasToScene, 0);
      const { x: offsetX, y: offsetY } = new THREE.Vector3(v.x, v.y).applyMatrix4(matrixWorld);
      const rootView = SceneUtil.getRootView() as THREE.Group;
      const [min, max] = ldeStore.scene.canvasZoomRange;
      deltaRatio = Math.max(rootView.scale.x * deltaRatio, min) / rootView.scale.x;
      deltaRatio = Math.min(rootView.scale.x * deltaRatio, max) / rootView.scale.x;
      rootView.scale.x *= deltaRatio;
      rootView.scale.y *= deltaRatio;
      const { x, y } = rootView.position;
      rootView.position.x = offsetX + (x - offsetX) * deltaRatio;
      rootView.position.y = offsetY + (y - offsetY) * deltaRatio;
      ldeStore.scene.$update({
        canvasZoom: rootView.scale.x,
        canvasPosition: {
          x: rootView.position.x,
          y: rootView.position.y,
        },
      });
    }
  }
}
