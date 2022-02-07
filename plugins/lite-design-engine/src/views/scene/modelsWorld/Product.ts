/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable react/no-array-index-key */
import { IViewEntity, MathUtils, Mesh3D, Reactive, ViewEntity3D, reactive, Reaction, Vector3, Element } from '@turbox3d/turbox3d';
import * as THREE from 'three';
import { appCommandBox } from '../../../commands/index';
import { WireFrame, FatLine, ClipMask } from '../helper/index';
import { ProductEntity } from '../../../models/entity/product';
import { ScalePointViewEntity } from './ScalePoint';
import { ScalePointEntity } from '../../../models/entity/scalePoint';
import { RotatePointViewEntity } from './RotatePoint';
import { RotatePointEntity } from '../../../models/entity/rotatePoint';
import { EntityCategory } from '../../../utils/category';
import { ScalePointSymbol, RotatePointSymbol, ClipPointSymbol, AdjustPointSymbol, DeletePointSymbol } from '../../../consts/scene';
import { ldeStore } from '../../../models/index';
import { ClipPointEntity } from '../../../models/entity/clipPoint';
import { ClipPointViewEntity } from './ClipPoint';
import { AdjustPointEntity } from '../../../models/entity/adjustPoint';
import { AdjustPointViewEntity } from './AdjustPoint';
import { DeletePointViewEntity } from './DeletePoint';
import { DeletePointEntity } from '../../../models/entity/deletePoint';
import { convertUrl } from '../../../utils/image';

interface IProps extends IViewEntity {
  model: ProductEntity;
}

@Reactive
export class ProductViewEntity extends ViewEntity3D<IProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale,
  ];

  protected onClickable() {
    const { model } = this.props;
    return model.isClickable;
  }

  protected onHoverable() {
    const { model } = this.props;
    return model.isHoverable;
  }

  protected onDraggable() {
    const { model } = this.props;
    return model.isDraggable;
  }

  protected onPinchable() {
    const { model } = this.props;
    return model.isPinchable;
  }

  protected onRotatable() {
    const { model } = this.props;
    return model.isRotatable;
  }

  protected onPressable() {
    const { model } = this.props;
    return model.isPressable;
  }

  render() {
    const { bizType } = ldeStore.scene;
    const { model } = this.props;
    const isSelected = appCommandBox.defaultCommand.select
      .getSelectedEntities()
      .includes(model);
    const views: Element[] = [];
    views.push({
      component: Product,
      props: {
        model,
      }
    });
    if (isSelected) {
      views.push({
        component: WireFrame,
        props: {
          model,
        }
      });
      if (bizType === 'iPad') {
        const dps = (Array.from(model.children).filter(child => EntityCategory.isDeletePoint(child)) as DeletePointEntity[])
          .map((e) => ({
            component: DeletePointViewEntity,
            props: {
              id: e.id,
              type: DeletePointSymbol,
              model: e,
              product: model,
            },
            key: e.id,
          }));
        const aps = (Array.from(model.children).filter(child => EntityCategory.isAdjustPoint(child)) as AdjustPointEntity[])
          .map((e) => ({
            component: AdjustPointViewEntity,
            props: {
              id: e.id,
              type: AdjustPointSymbol,
              model: e,
            },
            key: e.id,
          }));
        views.push(...dps, ...aps);
      } else if (bizType === 'PC') {
        const dps = (
          Array.from(model.children).filter(child => EntityCategory.isRotatePoint(child)) as RotatePointEntity[]
        ).map(e => ({
          component: RotatePointViewEntity,
          props: {
            id: e.id,
            type: RotatePointSymbol,
            model: e,
          },
          key: e.id,
        }));
        const aps = (
          Array.from(model.children).filter(child => EntityCategory.isScalePoint(child)) as ScalePointEntity[]
        ).map(e => ({
          component: ScalePointViewEntity,
          props: {
            id: e.id,
            type: ScalePointSymbol,
            model: e,
          },
          key: e.id,
        }));
        views.push(...dps, ...aps);
      }
    }
    if (ldeStore.scene.isClipMode && ldeStore.document.clipModel && ldeStore.document.clipModel.id === model.id) {
      const cps = (Array.from(ldeStore.document.clipModel.children).filter(child => EntityCategory.isClipPoint(child)) as ClipPointEntity[])
        .map(e => ({
        component: ClipPointViewEntity,
        props: {
          id: e.id,
          type: ClipPointSymbol,
          model: e,
        },
        key: e.id,
      }));
      views.push(...cps, {
        component: FatLine,
        props: {
          dashed: true,
          dashScale: 0.2,
          looped: true,
          color: 0xBF975B,
          position: new Vector3(0, 0, ldeStore.document.clipModel.position.z + 1),
          rotation: new Vector3(0, 0, 0),
          linePositions: (Array.from(ldeStore.document.clipModel.children).filter(child => EntityCategory.isClipPoint(child)) as ClipPointEntity[]).map(p => p.position.toArray()).flat(),
        },
        key: 1,
      }, {
        component: ClipMask,
        props: {
          model,
          points: Array.from(ldeStore.document.clipModel.children).filter(child => EntityCategory.isClipPoint(child)) as ClipPointEntity[],
        },
      });
    }
    if (model.snapped) {
      views.push({
        component: FatLine,
        props: {
          dashed: true,
          position: new Vector3(0, 0, model.position.z + 1),
          rotation: new Vector3(0, 0, -model.rotation.z * MathUtils.DEG2RAD),
          linePositions: [-100, 0, 0, 100, 0, 0],
        },
        key: 2,
      }, {
        component: FatLine,
        props: {
          dashed: true,
          position: new Vector3(0, 0, model.position.z + 1),
          rotation: new Vector3(0, 0, -model.rotation.z * MathUtils.DEG2RAD),
          linePositions: [0, -100, 0, 0, 100, 0],
        },
        key: 3,
      });
    }
    return views;
  }

  private updatePosition() {
    const { model } = this.props;
    this.view.position.set(
      model.position.x,
      model.position.y,
      model.position.z
    );
  }

  private updateRotation() {
    const { model } = this.props;
    this.view.rotation.set(
      model.rotation.x * MathUtils.DEG2RAD,
      model.rotation.y * MathUtils.DEG2RAD,
      model.rotation.z * MathUtils.DEG2RAD
    );
  }

  private updateScale() {
    const { model } = this.props;
    this.view.scale.set(model.scale.x, model.scale.y, model.scale.z);
  }
}

interface IProductProps {
  model: ProductEntity;
}

export class Product extends Mesh3D<IProductProps> {
  protected reactivePipeLine = [this.updateMaterial, this.updateRotation, this.updateGeometry];
  protected view = new THREE.Sprite();
  protected material = new THREE.SpriteMaterial();
  private reaction: Reaction;

  async updateMaterial() {
    const { model } = this.props;
    if (model.url) {
      // const url = model.url instanceof Blob ? URL.createObjectURL(model.url) : model.url;
      const loader = new THREE.TextureLoader();
      loader.setWithCredentials(true);
      const map = await loader.loadAsync(convertUrl(model.url)).catch((err) => {
        console.error(err);
      });
      // model.url instanceof Blob && URL.revokeObjectURL(url);
      if (!map) {
        return;
      }
      this.assignTexture(map);
    }
  }

  private assignTexture(map: THREE.Texture) {
    this.material.map = map;
    this.material.map.minFilter = THREE.LinearFilter;
    this.view.material = this.material;
    this.updateMaterialDirection();
  }

  async componentDidMount() {
    super.componentDidMount();
    this.reaction = reactive(() => {
      this.updateMaterialDirection();
    }, {
      deps: [
        () => this.props.model.materialDirection.x,
        () => this.props.model.materialDirection.y,
      ],
    });
  }

  componentWillUnmount() {
    this.reaction.dispose();
    super.componentWillUnmount();
  }

  updateMaterialDirection() {
    const { model } = this.props;
    if (this.material.map) {
      this.material.map.center.set(0.5, 0.5);
      this.material.map.repeat.set(model.materialDirection.x, model.materialDirection.y);
    }
  }

  updateRotation() {
    const { model } = this.props;
    // this.view.rotation.set(model.rotation.x * MathUtils.DEG2RAD, model.rotation.y * MathUtils.DEG2RAD, model.rotation.z * MathUtils.DEG2RAD);
    this.material.rotation = model.rotation.z * MathUtils.DEG2RAD;
  }

  updateGeometry() {
    const { model } = this.props;
    this.view.scale.set(model.size.x, model.size.y, model.size.z);
  }
}
