import { Reactive, Component, g } from '@turbox3d/turbox';
import { Product2DViewEntity } from './Product2D';
import { ProductEntity } from '../../../models/entity/product';
import { ldeStore } from '../../../models/index';
import { Product2DSymbol } from '../../../consts/scene';
import { SceneUtil } from '../modelsWorld/index';

@Reactive
export class TempWorld extends Component {
  render() {
    SceneUtil.get2DScreenShot = this.context.getTools().getScreenShot;
    SceneUtil.get2DApp = this.context.getTools().getApp;
    SceneUtil.get2DRootView = this.context.getTools().getRootView;
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
