import { Reactive, Vec3, EntityObject, Vec2, CoordinateType, Component, Element, createElement } from '@turbox3d/turbox3d';
import { ldeStore } from '../../../models/index';
import { ProductViewEntity } from './Product';
import { EntityCategory } from '../../../utils/category';
import { CubeViewEntity } from './Cube';
import { BackgroundViewEntity } from './Background';
import { ProductSymbol, BackgroundSymbol, CubeSymbol, AssemblySymbol, SkyBoxSymbol } from '../../../consts/scene';
import { AssemblyViewEntity } from './Assembly';
import { SkyBoxViewEntity } from '../skyBox/index';

export const SceneUtil = {
  getScene: (): any => {
    //
  },
  getCamera: (): any => {
    //
  },
  getScreenShot: async (sx?: number, sy?: number, w?: number, h?: number, fileType?: string, quality?: number, isBase64?: boolean): Promise<string | Blob> => '',
  getApp: (): any => {
    //
  },
  getRootView: (): any => {
    //
  },
  get2DRootView: (): any => {
    //
  },
  get2DScreenShot: async (sx?: number, sy?: number, w?: number, h?: number, fileType?: string, quality?: number, isBase64?: boolean): Promise<string | Blob> => '',
  get2DApp: (): any => {
    //
  },
  getProduct2DView: (): any => {
    //
  },
  coordinateTransform: (point: Vec3 | Vec2, type: CoordinateType, z?: number | undefined): any => {
    //
  },
  hitTarget: (point: { x: number; y: number; }): any => {
    //
  }
};

@Reactive
export class ModelsWorld extends Component {
  render() {
    SceneUtil.getScene = this.context.getTools().getScene;
    SceneUtil.getCamera = this.context.getTools().getCamera;
    SceneUtil.getApp = this.context.getTools().getApp;
    SceneUtil.getRootView = this.context.getTools().getRootView;
    SceneUtil.getScreenShot = this.context.getTools().getScreenShot;
    SceneUtil.coordinateTransform = this.context.getTools().coordinateTransform;
    SceneUtil.hitTarget = this.context.getTools().hitTarget;
    const views = this.renderEntityViews(ldeStore.document.models.values());
    return views;
  }

  private renderEntityViews = (entities: IterableIterator<EntityObject>) => {
    const views: Element[] = [];
    [...entities].forEach((entity) => {
      if (EntityCategory.isSkyBox(entity)) {
        views.push(
          createElement(SkyBoxViewEntity, {
            type: SkyBoxSymbol,
            id: entity.id,
            model: entity,
            key: entity.id,
          }),
        );
      }
      if (EntityCategory.isAssembly(entity)) {
        views.push(
          createElement(AssemblyViewEntity, {
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
          createElement(ProductViewEntity, {
            type: ProductSymbol,
            id: entity.id,
            model: entity,
            key: entity.id,
          }),
        );
      } else if (EntityCategory.isBackground(entity)) {
        views.push(
          createElement(BackgroundViewEntity, {
            type: BackgroundSymbol,
            id: entity.id,
            model: entity,
            key: entity.id,
          }),
        );
      } else if (EntityCategory.isCube(entity)) {
        views.push(
          createElement(CubeViewEntity, {
            type: CubeSymbol,
            id: entity.id,
            model: entity,
            key: entity.id,
          }),
        );
      }
    });
    return views;
  }
}
