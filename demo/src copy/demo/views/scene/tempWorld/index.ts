import { Reactive, Component, g } from '@byted-tx3d/turbox';

import { Product2DSymbol } from '../../../common/consts/scene';
import { ProductEntity } from '../../../models/entity/product';
import { ldeStore } from '../../../models/index';
import { SceneUtil } from '../modelsWorld/index';

import { Product2DViewEntity } from './Product2D';

@Reactive
export class TempWorld extends Component {
  render() {
    SceneUtil.get2DScreenShot = this.context.getSceneTools().getScreenShot;
    SceneUtil.get2DApp = this.context.getSceneTools().getApp;
    SceneUtil.get2DRootView = this.context.getSceneTools().getRootView;
    if (ldeStore.document.skewModel) {
      return [
        g(Product2DViewEntity, {
          model: ldeStore.document.skewModel as ProductEntity,
          id: ldeStore.document.skewModel.id,
          type: Product2DSymbol,
        }),
      ];
    }
    return null;
  }
}
