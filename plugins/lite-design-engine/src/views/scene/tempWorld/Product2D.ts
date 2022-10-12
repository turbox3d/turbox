import { Mesh2D, ViewEntity2D, MathUtils, Reactive, Rect2d, Polygon, createElement } from '@turbox3d/turbox';
import * as PIXI from 'pixi.js';
import * as PIXIProjection from 'pixi-projection';
import { ProductEntity } from '../../../models/entity/product';
import { SkewPointEntity } from '../../../models/entity/skewPoint';
import { EntityCategory } from '../../../utils/category';
import { SkewPointSymbol } from '../../../consts/scene';
import { ldeStore } from '../../../models/index';
import { SceneUtil } from '../modelsWorld/index';
import { Circle2d } from '../helper/index';

export interface IProduct2DProps {
  model: ProductEntity;
}

class ProductMesh2D extends Mesh2D<IProduct2DProps> {
  protected reactivePipeLine = [this.updateMaterial];
  protected view: PIXIProjection.Sprite2d;
  texture?: PIXI.Texture;
  modelUrl?: string | Blob;
  currentTicker?: PIXI.TickerCallback<any>;

  componentWillUnmount() {
    const app = this.context.getTools().getApp() as PIXI.Application;
    this.currentTicker && app.ticker.remove(this.currentTicker);
    super.componentWillUnmount();
  }

  componentDidMount() {
    super.componentDidMount();
    const app = this.context.getTools().getApp() as PIXI.Application;
    const target = ldeStore.document.skewModel;
    if (this.texture && target) {
      this.currentTicker = this.ticker(() => {
        return [...target.children.values()].filter(c => EntityCategory.isSkewPoint(c)).map((s) => s.position);
      });
      app.ticker.add(this.currentTicker);
    }
  }

  updateMaterial() {
    const { model } = this.props;
    if (model.url && this.modelUrl !== model.url) {
      this.modelUrl = model.url;
      const url = ldeStore.scene.isClipMode ? model.urlImage : model.skewOriginalUrlImage;
      const map = PIXI.Texture.from(url);
      this.assignTexture(map);
    }
  }

  private assignTexture(map: PIXI.Texture) {
    this.texture = map;
    this.view = new PIXIProjection.Sprite2d(this.texture);
    // this.view.width = model.size.x;
    // this.view.height = model.size.y;
    this.view.anchor.set(0.5);
  }

  // updateMaterialDirection() {
  //   const { model } = this.props;
  //   if (!this.texture) {
  //     return;
  //   }
  //   if (model.materialDirection.x === -1 && model.materialDirection.y === 1) {
  //     this.texture.rotate = PIXI.groupD8.MIRROR_HORIZONTAL;
  //   } else if (model.materialDirection.x === 1 && model.materialDirection.y === -1) {
  //     this.texture.rotate = PIXI.groupD8.MIRROR_VERTICAL;
  //   } else if (model.materialDirection.x === -1 && model.materialDirection.y === -1) {
  //     this.texture.rotate = PIXI.groupD8.add(PIXI.groupD8.MIRROR_HORIZONTAL, PIXI.groupD8.MIRROR_VERTICAL);
  //   } else {
  //     this.texture.rotate = 0;
  //   }
  // }

  ticker = (getSquares: () => PIXI.IPointData[]) => () => {
    this.view.proj.mapSprite(this.view, getSquares());
  };

  render() {
    SceneUtil.getProduct2DView = () => this.view;
    return super.render();
  }
}

export interface ISkewPointViewEntityProps {
  model: SkewPointEntity;
}

@Reactive
class SkewPointViewEntity extends ViewEntity2D<ISkewPointViewEntityProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale
  ];

  render() {
    const { model } = this.props;
    const alpha = ldeStore.scene.hideSkewPoint ? 0 : 1;
    const hotArea = ldeStore.scene.deviceType === 'iPad' ? this.props.model.radius * 6 : this.props.model.radius * 3;
    return [
      createElement(Circle2d, {
        radius: model.radius - 2.5,
        lineWidth: 5,
        lineColor: 0xbf975b,
        lineAlpha: alpha,
        fillColor: 0xffffff,
        fillAlpha: alpha,
      }),
      createElement(Rect2d, {
        width: hotArea,
        height: hotArea,
        alpha: 0,
        fillColor: 0xffffff,
        central: true,
      }),
    ];
  }

  private updatePosition() {
    const { model } = this.props;
    this.view.position.set(
      model.position.x,
      model.position.y,
    );
    this.view.zIndex = 2;
  }

  private updateRotation() {
    const { model } = this.props;
    this.view.rotation = model.rotation.z * MathUtils.DEG2RAD;
  }

  private updateScale() {
    const { model } = this.props;
    this.view.scale.set(model.scale.x, model.scale.y);
  }
}

export interface IProductViewEntityProps {
  model: ProductEntity;
}

@Reactive
export class Product2DViewEntity extends ViewEntity2D<IProductViewEntityProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale
  ];
  protected view: PIXI.Container;

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
    const { model } = this.props;
    const skewPoints = ldeStore.document.skewModel ? [...ldeStore.document.skewModel.children.values()].filter(c => EntityCategory.isSkewPoint(c)).map((s) => s.position) : [];
    const list = (Array.from(model.children).filter(child => EntityCategory.isSkewPoint(child)) as SkewPointEntity[])
      .map((e) => createElement(SkewPointViewEntity, {
        id: e.id,
        type: SkewPointSymbol,
        model: e,
        key: e.id,
      }));
    return [
      createElement(ProductMesh2D, {
        model,
      }),
      skewPoints.length && !ldeStore.scene.hideSkewPoint && createElement<any>(Polygon, {
        path: skewPoints,
        zIndex: 1,
        lineColor: 0xBF975B,
        lineWidth: 2 / ldeStore.scene.canvasZoom,
        fillAlpha: 0,
      }),
      ...list,
    ];
  }

  private updatePosition() {
    const { model } = this.props;
    this.view.position.set(
      model.position.x,
      model.position.y,
    );
  }

  private updateRotation() {
    const { model } = this.props;
    this.view.rotation = model.rotation.z * MathUtils.DEG2RAD;
  }

  private updateScale() {
    const { model } = this.props;
    this.view.scale.set(model.scale.x, model.scale.y);
  }
}
