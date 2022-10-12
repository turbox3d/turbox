import { IViewEntity, Reactive, ViewEntity3D, MathUtils, createElement } from '@turbox3d/turbox';
import { Circle, Rect3d } from '../helper/index';
import { DeletePointEntity } from '../../../models/entity/DeletePoint';
import { ldeStore } from '../../../models/index';
import { ProductEntity } from '../../../models/entity/product';
import { RenderOrder } from '../../../consts/scene';

interface IDeletePointProps extends IViewEntity {
  model: DeletePointEntity;
  product: ProductEntity;
}

@Reactive
export class DeletePointViewEntity extends ViewEntity3D<IDeletePointProps> {
  protected reactivePipeLine = [
    this.updatePosition,
    this.updateRotation,
    this.updateScale
  ];

  render() {
    const hotArea = ldeStore.scene.deviceType === 'iPad' ? this.props.model.radius * 6 : this.props.model.radius * 3;
    return [
      createElement(Rect3d, {
        width: hotArea,
        height: hotArea,
        opacity: 0,
        renderOrder: RenderOrder.CONTROL_POINT + 1,
      }),
      createElement(Circle, {
        radius: this.props.model.radius,
        imgUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01MGEtvl23jmpfiaF3A_!!6000000007292-55-tps-83-83.svg?x-oss-process=image/resize,w_60',
        renderOrder: RenderOrder.CONTROL_POINT,
      }),
    ];
  }

  onClick() {
    ldeStore.actions.deleteEntity([this.props.product]);
  }

  private updatePosition() {
    const { model } = this.props;
    this.view.position.set(model.position.x, model.position.y, model.position.z);
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
