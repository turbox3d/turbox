import { IViewEntity, Reactive, ViewEntity3D, MathUtils } from '@turbox3d/turbox3d';
import { Circle, Rect3d } from '../helper/index';
import { DeletePointEntity } from '../../../models/entity/DeletePoint';
import { ldeStore } from '../../../models/index';
import { ProductEntity } from '../../../models/entity/product';

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
    return [{
      component: Rect3d,
      props: {
        width: this.props.model.radius * 6,
        height: this.props.model.radius * 6,
        opacity: 0,
      },
    }, {
      component: Circle,
      props: {
        radius: this.props.model.radius,
        imgUrl: 'https://img.alicdn.com/imgextra/i3/O1CN01MGEtvl23jmpfiaF3A_!!6000000007292-55-tps-83-83.svg?x-oss-process=image/resize,w_60',
      },
    }];
  }

  onClick() {
    ldeStore.actions.deleteEntity([this.props.product]);
  }

  private updatePosition() {
    const { model } = this.props;
    this.view.position.set(
      model.position.x,
      model.position.y,
      model.position.z + 10,
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
