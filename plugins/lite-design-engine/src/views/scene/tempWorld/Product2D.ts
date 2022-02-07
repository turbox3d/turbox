import { Mesh2D, ViewEntity2D, IViewEntity, MathUtils, Reactive, Rect2d, Polygon, Element } from '@turbox3d/turbox3d';
import * as PIXI from 'pixi.js';
import * as PIXIProjection from 'pixi-projection';
import { ProductEntity } from '../../../models/entity/product';
import { SkewPointEntity } from '../../../models/entity/skewPoint';
import { EntityCategory } from '../../../utils/category';
import { SkewPointSymbol } from '../../../consts/scene';
import { ldeStore } from '../../../models/index';
import { SceneUtil } from '../modelsWorld/index';
import { Circle2d } from '../helper/index';
import { loadImageElement } from '../../../utils/image';

interface IProduct2DProps {
  model: ProductEntity;
}

class ProductMesh2D extends Mesh2D<IProduct2DProps> {
  protected reactivePipeLine = [this.updateMaterial];
  protected view: PIXIProjection.Sprite2d;
  protected isConcurrent = false;
  texture?: PIXI.Texture;
  modelUrl?: string | Blob;
  currentTicker?: PIXI.TickerCallback<any>;

  componentWillUnmount() {
    const app = this.context.getTools().getApp() as PIXI.Application;
    this.currentTicker && app.ticker.remove(this.currentTicker);
    super.componentWillUnmount();
  }

  async componentDidMount() {
    await super.componentDidMount();
    const app = this.context.getTools().getApp() as PIXI.Application;
    const target = ldeStore.document.skewModel;
    if (this.texture && target) {
      this.currentTicker = this.ticker(() => {
        return [...target.children.values()].filter(c => EntityCategory.isSkewPoint(c)).map((s) => s.position);
      });
      app.ticker.add(this.currentTicker);
    }
  }

  async updateMaterial() {
    const { model } = this.props;
    if (model.url && this.modelUrl !== model.url) {
      this.modelUrl = model.url;
      const url = ldeStore.scene.isClipMode ? model.url : model.skewOriginalUrl;
      const { element } = await loadImageElement(url);
      const map = PIXI.Texture.from(element);
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

interface ISkewPointViewEntityProps extends IViewEntity {
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
    return [{
      component: Circle2d,
      props: {
        radius: model.radius - 2.5,
        lineWidth: 5,
        lineColor: 0xBF975B,
        lineAlpha: alpha,
        fillColor: 0xFFFFFF,
        fillAlpha: alpha,
      },
    }, {
      component: Rect2d,
      props: {
        width: model.radius * 6,
        height: model.radius * 6,
        alpha: 0,
        fillColor: 0xFFFFFF,
        central: true,
      },
    }];
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

interface IProductViewEntityProps extends IViewEntity {
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

  render() {
    const { model } = this.props;
    const skewPoints = ldeStore.document.skewModel ? [...ldeStore.document.skewModel.children.values()].filter(c => EntityCategory.isSkewPoint(c)).map((s) => s.position) : [];
    const views: Element[] = [{
      component: ProductMesh2D,
      props: {
        model,
      }
    }];
    if (skewPoints.length && !ldeStore.scene.hideSkewPoint) {
      views.push({
        component: Polygon,
        props: {
          path: skewPoints,
          zIndex: 1,
          lineColor: 0xBF975B,
          lineWidth: 2 / ldeStore.scene.canvasZoom,
          fillAlpha: 0,
        },
      });
    }
    const sps = (Array.from(model.children).filter(child => EntityCategory.isSkewPoint(child)) as SkewPointEntity[])
      .map((e) => ({
        component: SkewPointViewEntity,
        props: {
          id: e.id,
          type: SkewPointSymbol,
          model: e,
        },
        key: e.id,
      }));
    views.push(...sps);
    return views;
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
