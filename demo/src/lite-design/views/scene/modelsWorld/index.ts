import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { Reactive, Vec3, EntityObject, Vec2, CoordinateType, Component, Element, g } from '@turbox3d/turbox';

import {
  ProductSymbol,
  BackgroundSymbol,
  CubeSymbol,
  AssemblySymbol,
  SkyBoxSymbol
} from '../../../common/consts/scene';
import { ldeStore } from '../../../models/index';
import { EntityCategory } from '../../../utils/category';
import { m } from '../index';
import { SkyBoxViewEntity } from '../skyBox/index';

import { AssemblyViewEntity } from './Assembly';
import { BackgroundViewEntity } from './Background';
import { CubeViewEntity } from './Cube';
import { ProductViewEntity } from './Product';

export const SceneUtil = {
  getScene: (): any => {
    //
  },
  getCamera: (): any => {
    //
  },
  getScreenShot: async (
    sx?: number,
    sy?: number,
    w?: number,
    h?: number,
    fileType?: string,
    quality?: number,
    isBase64?: boolean
  ): Promise<string | Blob> => '',
  getApp: (): any => {
    //
  },
  getRootView: (): any => {
    //
  },
  get2DRootView: (): any => {
    //
  },
  get2DScreenShot: async (
    sx?: number,
    sy?: number,
    w?: number,
    h?: number,
    fileType?: string,
    quality?: number,
    isBase64?: boolean
  ): Promise<string | Blob> => '',
  get2DApp: (): any => {
    //
  },
  getProduct2DView: (): any => {
    //
  },
  coordinateTransform: (point: Vec3 | Vec2, type: CoordinateType, z?: number | undefined): any => {
    //
  },
  hitTarget: (point: { x: number; y: number }): any => {
    //
  },
};

@Reactive
export class ModelsWorld extends Component {
  tick = (deltaTime: number) => {
    if (m.getControls()) {
      (m.getControls() as OrbitControls).update(deltaTime);
    }
  }

  componentDidMount() {
    this.context.getSceneTools().addTicker(this.tick);
  }

  componentWillUnmount() {
    this.context.getSceneTools().removeTicker(this.tick);
  }

  render() {
    SceneUtil.getScene = this.context.getSceneTools().getScene;
    SceneUtil.getCamera = this.context.getSceneTools().getCamera;
    SceneUtil.getApp = this.context.getSceneTools().getApp;
    SceneUtil.getRootView = this.context.getSceneTools().getRootView;
    SceneUtil.getScreenShot = this.context.getSceneTools().getScreenShot;
    SceneUtil.coordinateTransform = this.context.getSceneTools().coordinateTransform;
    SceneUtil.hitTarget = this.context.getSceneTools().hitTarget;
    const views = this.renderEntityViews(ldeStore.document.models.values());
    return views;
  }

  private renderEntityViews = (entities: IterableIterator<EntityObject>) => {
    const views: Element[] = [];
    [...entities].forEach(entity => {
      if (EntityCategory.isSkyBox(entity)) {
        views.push(
          g(SkyBoxViewEntity, {
            type: SkyBoxSymbol,
            id: entity.id,
            model: entity,
            key: entity.id,
          })
        );
      }
      if (EntityCategory.isAssembly(entity)) {
        views.push(
          g(AssemblyViewEntity, {
            type: AssemblySymbol,
            id: entity.id,
            model: entity,
            renderEntityViews: this.renderEntityViews,
            key: entity.id,
          })
        );
      }
      if (EntityCategory.isProduct(entity)) {
        views.push(
          g(ProductViewEntity, {
            type: ProductSymbol,
            id: entity.id,
            model: entity,
            key: entity.id,
          })
        );
      } else if (EntityCategory.isBackground(entity)) {
        views.push(
          g(BackgroundViewEntity, {
            type: BackgroundSymbol,
            id: entity.id,
            model: entity,
            key: entity.id,
          })
        );
      } else if (EntityCategory.isCube(entity)) {
        views.push(
          g(CubeViewEntity, {
            type: CubeSymbol,
            id: entity.id,
            model: entity,
            key: entity.id,
          })
        );
      }
    });
    return views;
  };
}
